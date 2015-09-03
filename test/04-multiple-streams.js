
var http = require('http')
  , zlib = require('zlib')
var should = require('should')
  , debug = require('debug')
  , iconv = require('iconv-lite')
var request = require('../index')

console.debug = debug('server')


describe('04-multiple-streams', function () {

  describe('piping it externally', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        res.writeHead(200, {'content-encoding': 'deflate'})
        var buff = new Buffer('Pathé Chamnord Ç, ç, Ð, ð', 'ascii')
        res.end(zlib.deflateSync(buff))
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
          'transfer-encoding': 'chunked',
          'accept-encoding': 'gzip,deflate'
        },

        protocol: 'http',
      })

      req
        .pipe(zlib.createInflate())
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

  describe('gzip-stream + encoding-stream', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        res.writeHead(200, {'content-encoding': 'deflate'})
        var buff = new Buffer('Pathé Chamnord Ç, ç, Ð, ð', 'ascii')
        res.end(zlib.deflateSync(buff))
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
          'transfer-encoding': 'chunked',
          'accept-encoding': 'gzip,deflate'
        },

        protocol: 'http:',
        gzip: true,
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
