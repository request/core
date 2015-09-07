
var fs = require('fs')
  , path = require('path')
  , http = require('http')
  , zlib = require('zlib')
var should = require('should')
  , debug = require('debug')
var request = require('../index')

var image0 = path.join(__dirname, './fixtures/cat0.png')
  , image1 = path.join(__dirname, './fixtures/cat1.png')
  , image2 = path.join(__dirname, './fixtures/cat2.png')
var tmp = path.join(__dirname, './tmp/cat.png')

console.debug = debug('server')


describe('- redirect', function () {

  describe('stream file', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        if (req.url === '/redirect') {
          console.debug('redirect')
          res.writeHead(301, {'location': '/'})
          res.end()
        } else {
          console.debug('send')
          req.on('data', function (data) {
            console.debug('write')
          })
          req.pipe(res)
        }
      })
      server.listen(6767, done)
    })

    it('0', function (done) {
      var input = fs.createReadStream(image2, {highWaterMark: 1024})
        , output = fs.createWriteStream(tmp)

      var req = request({
        method: 'GET',
        host: 'localhost',
        port: 6767,
        path: '/redirect',
        headers: {
          'transfer-encoding': 'chunked'
        },

        protocol: 'http',
        redirect: true
      })

      input
        .pipe(req)
        .pipe(output)

      output.on('close', function () {
        var stats = fs.statSync(tmp)
        stats.size.should.equal(22025)
        done()
      })
    })

    after(function (done) {
      server.close(done)
    })
  })

  describe('gzip stream file', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        if (req.url === '/redirect') {
          console.debug('redirect')
          res.writeHead(301, {'location': '/'})
          res.end()
        } else {
          console.debug('send')
          req.on('data', function (data) {
            console.debug('write')
          })
          res.writeHead(200, {'content-encoding': 'deflate'})
          req.pipe(zlib.createDeflate()).pipe(res)
        }
      })
      server.listen(6767, done)
    })

    it('1', function (done) {
      var input = fs.createReadStream(image2, {highWaterMark: 1024})
        , output = fs.createWriteStream(tmp)

      var req = request({
        method: 'GET',
        host: 'localhost',
        port: 6767,
        path: '/redirect',
        headers: {
          'transfer-encoding': 'chunked',
          'accept-encoding': 'gzip,deflate'
        },

        protocol: 'http',
        gzip: true,
        redirect: true
      })

      input
        .pipe(req)
        .pipe(output)

      output.on('close', function () {
        var stats = fs.statSync(tmp)
        stats.size.should.equal(22025)
        done()
      })
    })

    after(function (done) {
      server.close(done)
    })
  })

  describe('stream file callback', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        if (req.url === '/redirect') {
          console.debug('redirect')
          res.writeHead(301, {'location': '/'})
          res.end()
        } else {
          console.debug('send')
          req.on('data', function (data) {
            console.debug('write')
          })
          req.pipe(res)
        }
      })
      server.listen(6767, done)
    })

    it('2', function (done) {
      var input = fs.createReadStream(image2, {highWaterMark: 1024})

      var req = request({
        method: 'GET',
        host: 'localhost',
        port: 6767,
        path: '/redirect',
        headers: {
          'transfer-encoding': 'chunked'
        },

        protocol: 'http',
        encoding: 'binary',
        redirect: true,
        callback: function (err, res, body) {
          fs.writeFileSync(tmp, body)
          var stats = fs.statSync(tmp)
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

  describe('stream file without pipe', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        if (req.url === '/redirect') {
          console.debug('redirect')
          res.writeHead(301, {'location': '/'})
          res.end()
        } else {
          console.debug('send')
          var input = fs.createReadStream(image2, {highWaterMark: 1024})
          input.on('data', function (data) {
            console.debug('write')
          })
          input.pipe(res)
        }
      })
      server.listen(6767, done)
    })

    it('3', function (done) {
      var req = request({
        method: 'GET',
        host: 'localhost',
        port: 6767,
        path: '/redirect',
        headers: {
          'transfer-encoding': 'chunked'
        },

        protocol: 'http',
        redirect: true,
        encoding: 'binary',
        callback: function (err, res, body) {
          fs.writeFileSync(tmp, body)
          var stats = fs.statSync(tmp)
          stats.size.should.equal(22025)
          done()
        }
      })
    })

    after(function (done) {
      server.close(done)
    })
  })

})
