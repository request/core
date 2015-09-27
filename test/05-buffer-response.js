
var fs = require('fs')
  , path = require('path')
  , http = require('http')
  , zlib = require('zlib')
var should = require('should')
  , debug = require('debug')
  , bl = require('bl')
var request = require('request-client')

var image0 = path.join(__dirname, './fixtures/cat0.png')
  , image1 = path.join(__dirname, './fixtures/cat1.png')
  , image2 = path.join(__dirname, './fixtures/cat2.png')
var tmp = path.join(__dirname, './tmp/cat.png')

console.server = debug('server')
console.client = debug('client')


describe('- buffer-response', function () {

  describe('buffer externally', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.server(req.headers)
        req.pipe(res)
      })
      server.listen(6767, done)
    })

    it('0', function (done) {
      var input = fs.createReadStream(image2, {highWaterMark: 1024})

      var req = request({
        url: 'http://localhost:6767'
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
          fs.writeFileSync(tmp, buffer.slice())
          // string
          // fs.writeFileSync(output, buffer.toString('some encoding'))
          var stats = fs.statSync(tmp)
          stats.size.should.equal(22025)
          done()
        })

    })

    after(function (done) {
      server.close(done)
    })
  })

  describe('callback + binary', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.server(req.headers)
        req.pipe(res)
      })
      server.listen(6767, done)
    })

    it('1', function (done) {
      var input = fs.createReadStream(image2, {highWaterMark: 1024})

      var req = request({
        url: 'http://localhost:6767',
        encoding: 'binary',
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

  describe('callback + string', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.server(req.headers)
        res.end(JSON.stringify({a:'b'}))
      })
      server.listen(6767, done)
    })

    it('2', function (done) {
      var req = request({
        url: 'http://localhost:6767',
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

  describe('callback + binary + gzip', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.server(req.headers)
        res.writeHead(200, {'content-encoding': 'deflate'})
        req.pipe(zlib.createDeflate()).pipe(res)
      })
      server.listen(6767, done)
    })

    it('3', function (done) {
      var input = fs.createReadStream(image2, {highWaterMark: 1024})

      var req = request({
        url: 'http://localhost:6767',
        encoding: 'binary',
        gzip: true,
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

  describe('callback + encoding', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.server(req.headers)
        res.writeHead(200, {})
        // ISO-8859-1
        // transfer the characters with wrong encoding
        res.end('Pathé Chamnord Ç, ç, Ð, ð', 'ascii')
      })
      server.listen(6767, done)
    })

    it('4', function (done) {
      var req = request({
        url: 'http://localhost:6767',
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
