
var http = require('http')
  , zlib = require('zlib')
var should = require('should')
  , debug = require('debug')
  , iconv = require('iconv-lite')
var request = require('@request/client')

console.server = debug('server')
console.client = debug('client')


describe('- multiple-streams', function () {

  describe('piping it externally', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.server(req.headers)
        res.writeHead(200, {'content-encoding': 'deflate'})
        var buff = new Buffer('Pathé Chamnord Ç, ç, Ð, ð', 'ascii')
        res.end(zlib.deflateSync(buff))
      })
      server.listen(6767, done)
    })

    it('0', function (done) {
      var req = request({
        url: 'http://localhost:6767',
        headers: {
          'accept-encoding': 'gzip, deflate'
        }
      })

      req
        .pipe(zlib.createInflate())
        .pipe(iconv.decodeStream('ISO-8859-1'))

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

  describe('gzip + encoding stream', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.server(req.headers)
        res.writeHead(200, {'content-encoding': 'deflate'})
        var buff = new Buffer('Pathé Chamnord Ç, ç, Ð, ð', 'ascii')
        res.end(zlib.deflateSync(buff))
      })
      server.listen(6767, done)
    })

    it('1', function (done) {
      var req = request({
        url: 'http://localhost:6767',
        gzip: true,
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

})
