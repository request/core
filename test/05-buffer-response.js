
var fs = require('fs')
  , path = require('path')
  , http = require('http')
  , zlib = require('zlib')
var should = require('should')
  , debug = require('debug')
  , bl = require('bl')
var request = require('../index')

var image = path.join(__dirname, './fixtures/cat.png')
  , image2 = path.join(__dirname, './tmp/cat2.png')

console.debug = debug('server')


describe('- buffer-response', function () {

  describe('buffer externally', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        req.pipe(res)
      })
      server.listen(6767, done)
    })

    it('0', function (done) {
      var input = fs.createReadStream(image, {
        highWaterMark: 1024
      })

      var req = request({
        method: 'GET',
        host: 'localhost',
        port: 6767,
        path: '/',
        headers: {
          'transfer-encoding': 'chunked'
        },

        protocol: 'http',
      })

      input
        .pipe(req)

      var buffer = bl()

      req
        .on('data', function (chunk) {
          buffer.append(chunk)
        })
        .on('end', function () {
          // binary
          fs.writeFileSync(image2, buffer.slice())
          // string
          // fs.writeFileSync(output, buffer.toString('some encoding'))
          var stats = fs.statSync(image2)
          stats.size.should.equal(22025)
          done()
        })

    })

    after(function (done) {
      server.close(done)
    })
  })

  describe('buffer binary using buffer-response', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        req.pipe(res)
      })
      server.listen(6767, done)
    })

    it('1', function (done) {
      var input = fs.createReadStream(image, {
        highWaterMark: 1024
      })

      var req = request({
        method: 'GET',
        host: 'localhost',
        port: 6767,
        path: '/',
        headers: {
          'transfer-encoding': 'chunked'
        },

        protocol: 'http',
        encoding: 'binary',
        callback: function (err, res, body) {
          fs.writeFileSync(image2, body)

          var stats = fs.statSync(image2)
          stats.size.should.equal(22025)
          done()
        }
      })

      input
        .pipe(req)
    })

    after(function (done) {
      server.close(done)
    })
  })

  describe('buffer string using buffer-response', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.debug('request')
        res.end(JSON.stringify({a:'b'}))
      })
      server.listen(6767, done)
    })

    it('2', function (done) {
      var req = request({
        method: 'GET',
        host: 'localhost',
        port: 6767,
        path: '/',
        headers: {
          'accept': 'text/plain',
          'transfer-encoding': 'chunked'
        },

        protocol: 'http',
        callback: function (err, res, body) {
          should.deepEqual(JSON.parse(body), {a:'b'})
          done()
        }
      })
    })

    after(function (done) {
      server.close(done)
    })
  })

  describe('buffer-response binary + gzip-stream', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        res.writeHead(200, {'content-encoding': 'deflate'})
        req.pipe(zlib.createDeflate()).pipe(res)
      })
      server.listen(6767, done)
    })

    it('3', function (done) {
      var input = fs.createReadStream(image, {
        highWaterMark: 1024
      })

      var req = request({
        method: 'GET',
        host: 'localhost',
        port: 6767,
        path: '/',
        headers: {
          'transfer-encoding': 'chunked'
        },

        protocol: 'http',
        encoding: 'binary',
        gzip: true,
        callback: function (err, res, body) {
          fs.writeFileSync(image2, body)

          var stats = fs.statSync(image2)
          stats.size.should.equal(22025)
          done()
        }
      })

      input
        .pipe(req)
    })

    after(function (done) {
      server.close(done)
    })
  })

  describe('buffer-response string + encoding-stream', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.debug('request')
        res.writeHead(200, {})
        // ISO-8859-1
        // transfer the characters with wrong encoding
        res.end('Pathé Chamnord Ç, ç, Ð, ð', 'ascii')
      })
      server.listen(6767, done)
    })

    it('4', function (done) {
      var req = request({
        method: 'GET',
        host: 'localhost',
        port: 6767,
        path: '/',

        protocol: 'http',
        encoding: 'ISO-8859-1',
        callback: function (err, res, body) {
          should.deepEqual(body, 'Pathé Chamnord Ç, ç, Ð, ð')
          done()
        }
      })
    })

    after(function (done) {
      server.close(done)
    })
  })

})
