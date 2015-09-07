
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


describe('- gzip-stream', function () {

  describe('piping it externally', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        res.writeHead(200, {'content-encoding': 'deflate'})
        req.pipe(zlib.createDeflate()).pipe(res)
      })
      server.listen(6767, done)
    })

    it('0', function (done) {
      var input = fs.createReadStream(image2, {highWaterMark: 1024})
        , output = fs.createWriteStream(tmp)

      var req = request({
        method: 'GET',
        url: 'http://localhost:6767'
      })

      input
        .pipe(req)
        .pipe(zlib.createInflate())
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

  describe('piping it using external on.response event', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        res.writeHead(200, {'content-encoding': 'deflate'})
        req.pipe(zlib.createDeflate()).pipe(res)
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
        path: '/',

        protocol: 'http',
      })
      req.on('response', function (res) {
        var encoding = res.headers['content-encoding'] || 'identity'
        var decompress = null
        if (encoding.match(/\bdeflate\b/)) {
          decompress = zlib.createInflate()
        } else if (encoding.match(/\bgzip\b/)) {
          decompress = zlib.createGunzip()
        }
        req._res = res.pipe(decompress)
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

  describe('piping it using the gzip-stream', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        res.writeHead(200, {'content-encoding': 'deflate'})
        req.pipe(zlib.createDeflate()).pipe(res)
      })
      server.listen(6767, done)
    })

    it('2', function (done) {
      var input = fs.createReadStream(image2, {highWaterMark: 1024})
        , output = fs.createWriteStream(tmp)

      var req = request({
        method: 'GET',
        host: 'localhost',
        port: 6767,
        path: '/',
        headers: {
          'transfer-encoding': 'chunked',
          'accept-encoding': 'gzip,deflate'
        },

        protocol: 'http',
        gzip: true
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

})
