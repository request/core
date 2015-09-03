
var http = require('http')
var should = require('should')
  , debug = require('debug')
  , iconv = require('iconv-lite')
var request = require('../index')

console.debug = debug('server')


describe('03-encoding-stream', function () {

  describe('piping it externally', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        res.writeHead(200, {})
        // ISO-8859-1
        // transfer the characters with wrong encoding
        res.end('Pathé Chamnord Ç, ç, Ð, ð', 'ascii')
      })
      server.listen(6767, done)
    })

    it('0', function (done) {
      var req = request({
        method: 'GET',
        host: 'localhost',
        port: 6767,
        path: '/',
        headers: {
          'transfer-encoding': 'chunked'
        },

        protocol: 'http'
      })

      req
        .pipe(iconv.decodeStream('ISO-8859-1'))

        .on('data', function (chunk) {
          console.debug(chunk.toString())
          chunk.toString().should.equal('Pathé Chamnord Ç, ç, Ð, ð')
        })
        .on('end', done)
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
        res.writeHead(200, {})
        // ISO-8859-1
        // transfer the characters with wrong encoding
        res.end('Pathé Chamnord Ç, ç, Ð, ð', 'ascii')
      })
      server.listen(6767, done)
    })

    it('1', function (done) {
      var req = request({
        method: 'GET',
        host: 'localhost',
        port: 6767,
        path: '/',
        headers: {
          'transfer-encoding': 'chunked'
        },

        protocol: 'http'
      })
      req.on('response', function (res) {
        // probably should detect the content encoding somehow
        req._res = res.pipe(iconv.decodeStream('ISO-8859-1'))
      })

      req
        .on('data', function (chunk) {
          console.debug(chunk.toString())
          chunk.toString().should.equal('Pathé Chamnord Ç, ç, Ð, ð')
        })
        .on('end', done)
    })

    after(function (done) {
      server.close(done)
    })
  })

  describe('piping it using the encoding-stream', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        res.writeHead(200, {})
        // ISO-8859-1
        // transfer the characters with wrong encoding
        res.end('Pathé Chamnord Ç, ç, Ð, ð', 'ascii')
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
          'transfer-encoding': 'chunked'
        },

        protocol: 'http',
        encoding: 'ISO-8859-1'
      })

      req
        .on('data', function (chunk) {
          console.debug(chunk.toString())
          chunk.toString().should.equal('Pathé Chamnord Ç, ç, Ð, ð')
        })
        .on('end', done)
    })

    after(function (done) {
      server.close(done)
    })
  })

})
