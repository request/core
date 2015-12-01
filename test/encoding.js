
var http = require('http')
var should = require('should')
  , debug = require('debug')
  , iconv = require('iconv-lite')
var request = require('@request/client')

console.server = debug('server')
console.client = debug('client')


describe('- encoding-stream', function () {

  describe('piping it externally', function () {
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

    it('0', function (done) {
      var req = request({
        url: 'http://localhost:6767'
      })

      var piped = req.pipe(iconv.decodeStream('ISO-8859-1'))

      piped
        .on('data', function (chunk) {
          console.client(chunk.toString())
          chunk.toString().should.equal('Pathé Chamnord Ç, ç, Ð, ð')
        })
        .on('end', done)

      req.end()
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
        console.server(req.headers)
        res.writeHead(200, {})
        // ISO-8859-1
        // transfer the characters with wrong encoding
        res.end('Pathé Chamnord Ç, ç, Ð, ð', 'ascii')
      })
      server.listen(6767, done)
    })

    it('1', function (done) {
      var req = request({
        url: 'http://localhost:6767'
      })
      req
        .on('response', function (res) {
          req._res = res.pipe(iconv.decodeStream('ISO-8859-1'))
        })
        .on('data', function (chunk) {
          console.client(chunk.toString())
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
        console.server(req.headers)
        res.writeHead(200, {})
        // ISO-8859-1
        // transfer the characters with wrong encoding
        res.end('Pathé Chamnord Ç, ç, Ð, ð', 'ascii')
      })
      server.listen(6767, done)
    })

    it('2', function (done) {
      var req = request({
        url: 'http://localhost:6767',
        encoding: 'ISO-8859-1'
      })

      req
        .on('data', function (chunk) {
          console.client(chunk.toString())
          chunk.toString().should.equal('Pathé Chamnord Ç, ç, Ð, ð')
        })
        .on('end', done)
    })

    after(function (done) {
      server.close(done)
    })
  })

  describe('detect encoding from content-type; charset', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.server(req.headers)
        res.writeHead(200, {'content-type': 'text/plain; charset=ISO-8859-1'})
        // ISO-8859-1
        // transfer the characters with wrong encoding
        res.end('Pathé Chamnord Ç, ç, Ð, ð', 'ascii')
      })
      server.listen(6767, done)
    })

    it('3', function (done) {
      var req = request({
        url: 'http://localhost:6767',
        encoding: true
      })

      req
        .on('data', function (chunk) {
          console.client(chunk.toString())
          chunk.toString().should.equal('Pathé Chamnord Ç, ç, Ð, ð')
        })
        .on('end', done)
    })

    after(function (done) {
      server.close(done)
    })
  })

})
