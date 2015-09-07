
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


describe('- body', function () {

  describe('body stream', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.debug('request')
        req.pipe(res)
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
        path: '/',
        headers: {
          'transfer-encoding': 'chunked'
        },

        protocol: 'http',
        body: input
      })

      req
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

  describe('redirect body stream', function () {
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

    it('1', function (done) {
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
        redirect: true,
        body: input
      })

      req
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

  describe('body stream + content-length', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.debug('request')
        req.pipe(res)
      })
      server.listen(6767, done)
    })

    it('2', function (done) {
      var input = fs.createReadStream(image2, {highWaterMark: 1024})
        , output = fs.createWriteStream(tmp)

      var req = request({
        method: 'GET',
        url: 'http://localhost:6767',
        headers: {
          'content-length': 22025
        },

        body: input
      })

      req
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

  describe('buffer + content-length', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        var data = ''
        req.on('data', function (chunk) {
          data += chunk
        })
        req.on('end', function () {
          res.end(data)
        })
      })
      server.listen(6767, done)
    })

    it('3', function (done) {
      var req = request({
        method: 'GET',
        url: 'http://localhost:6767',
        headers: {
          'content-length': 4
        },

        body: Buffer('poop'),
        callback: function (err, res, body) {
          body.should.equal('poop')
          done()
        }
      })
    })

    after(function (done) {
      server.close(done)
    })
  })

  describe('buffer - content-length', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        var data = ''
        req.on('data', function (chunk) {
          data += chunk
        })
        req.on('end', function () {
          res.end(data)
        })
      })
      server.listen(6767, done)
    })

    it('4', function (done) {
      var req = request({
        method: 'GET',
        url: 'http://localhost:6767',

        body: Buffer('poop'),
        callback: function (err, res, body) {
          body.should.equal('poop')
          done()
        }
      })
    })

    after(function (done) {
      server.close(done)
    })
  })

  describe('string - content-length', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        var data = ''
        req.on('data', function (chunk) {
          data += chunk
        })
        req.on('end', function () {
          res.end(data)
        })
      })
      server.listen(6767, done)
    })

    it('5', function (done) {
      var req = request({
        method: 'GET',
        url: 'http://localhost:6767',

        body: 'poop',
        callback: function (err, res, body) {
          body.should.equal('poop')
          done()
        }
      })
    })

    after(function (done) {
      server.close(done)
    })
  })

  describe('array - content-length', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        req.pipe(res)
      })
      server.listen(6767, done)
    })

    it('6', function (done) {
      var input = fs.readFileSync(image2)

      var req = request({
        method: 'GET',
        url: 'http://localhost:6767',

        body: ['amazing', 'wqw', 'poop'],
        callback: function (err, res, body) {
          body.toString().should.equal('amazingwqwpoop')
          done()
        }
      })
    })

    after(function (done) {
      server.close(done)
    })
  })

})
