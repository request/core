
var fs = require('fs')
  , path = require('path')
  , http = require('http')
  , zlib = require('zlib')
var should = require('should')
  , debug = require('debug')
var request = require('../index')

var image = path.join(__dirname, './fixtures/cat.png')
  , image2 = path.join(__dirname, './tmp/cat2.png')

console.debug = debug('server')


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
    var input = fs.createReadStream(image, {
      highWaterMark: 1024
    })
    var output = fs.createWriteStream(image2)

    var req = request({
      method: 'GET',
      host: 'localhost',
      port: 6767,
      path: '/',
      headers: {
        'transfer-encoding': 'chunked',
        'accept-encoding': 'gzip,deflate'
      },

      protocol: 'http'
    })

    input
      .pipe(req)
      .pipe(zlib.createInflate())
      .pipe(output)

    output.on('close', function () {
      var stats = fs.statSync(image2)
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
    var input = fs.createReadStream(image, {
      highWaterMark: 1024
    })
    var output = fs.createWriteStream(image2)

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
      var stats = fs.statSync(image2)
      stats.size.should.equal(22025)
      done()
    })
  })

  after(function (done) {
    server.close(done)
  })
})

describe('piping it using the gzip-stream module', function () {
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
    var input = fs.createReadStream(image, {
      highWaterMark: 1024
    })
    var output = fs.createWriteStream(image2)

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
      var stats = fs.statSync(image2)
      stats.size.should.equal(22025)
      done()
    })
  })

  after(function (done) {
    server.close(done)
  })
})
