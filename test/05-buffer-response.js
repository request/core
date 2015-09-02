
var fs = require('fs')
  , path = require('path')
  , http = require('http')
var should = require('should')
  , debug = require('debug')
  , bl = require('bl')
var request = require('../index')

var image = path.join(__dirname, '../fixtures/cat.png')
  , image2 = path.join(__dirname, '../tmp/cat2.png')

console.debug = debug('server')


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

describe('buffer using buffer-response module', function () {
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

describe('buffer string using buffer-response module', function () {
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
