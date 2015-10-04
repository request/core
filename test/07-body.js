
var fs = require('fs')
  , path = require('path')
  , http = require('http')
  , zlib = require('zlib')
var should = require('should')
  , debug = require('debug')
var request = require('@http/client')

var image0 = path.join(__dirname, './fixtures/cat0.png')
  , image1 = path.join(__dirname, './fixtures/cat1.png')
  , image2 = path.join(__dirname, './fixtures/cat2.png')
var tmp = path.join(__dirname, './tmp/cat.png')

console.server = debug('server')
console.client = debug('client')


describe('- body', function () {

  describe('body stream', function () {
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
        , output = fs.createWriteStream(tmp)

      var req = request({
        method: 'POST',
        url: 'http://localhost:6767',
        body: input
      })

      req.pipe(output)

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
          console.server(req.headers, 'redirect')
          res.writeHead(301, {'location': '/'})
          res.end()
        } else {
          console.server(req.headers, 'response')
          req.on('data', function (data) {
            console.server('data')
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
        method: 'POST',
        url: 'http://localhost:6767/redirect',
        redirect: {all: true},
        body: input
      })

      req.pipe(output)

      req.on('response', function (res) {
        console.client(res.headers)
      })

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

  describe('body file + pipe output', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.server(req.headers)
        req.pipe(res)
      })
      server.listen(6767, done)
    })

    it('3', function (done) {
      var input = fs.readFileSync(image2)
        , output = fs.createWriteStream(tmp)

      var req = request({
        method: 'POST',
        url: 'http://localhost:6767',
        body: input
      })

      req.pipe(output)

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

  describe('body file + callback', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.server(req.headers)
        req.pipe(res)
      })
      server.listen(6767, done)
    })

    it('4', function (done) {
      var input = fs.readFileSync(image2)

      var req = request({
        method: 'POST',
        url: 'http://localhost:6767',
        encoding: 'binary',
        body: input,
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

  describe('body buffer + callback', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.server(req.headers)
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

    it('6', function (done) {
      var req = request({
        method: 'POST',
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

  describe('body string + callback', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.server(req.headers)
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

    it('7', function (done) {
      var req = request({
        method: 'POST',
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

  describe('body array + callback', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.server(req.headers)
        req.pipe(res)
      })
      server.listen(6767, done)
    })

    it('8', function (done) {
      var req = request({
        method: 'POST',
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
