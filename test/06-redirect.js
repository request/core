
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


describe.skip('- redirect', function () {

  describe('stream file', function () {
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

    it('0', function (done) {
      var input = fs.createReadStream(image2, {highWaterMark: 1024})
        , output = fs.createWriteStream(tmp)

      var req = request({
        method: 'POST',
        url: 'http://localhost:6767/redirect',
        redirect: {all: true}
      })

      input
        .pipe(req)
        .pipe(output)

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

  describe('stream file + gzip', function () {
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
          res.writeHead(200, {'content-encoding': 'deflate'})
          req.pipe(zlib.createDeflate()).pipe(res)
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
        gzip: true,
        redirect: {all: true}
      })

      input
        .pipe(req)
        .pipe(output)

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

  describe('stream file + gzip + multiple redirects', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        if (req.url === '/redirect1') {
          console.server(req.headers, 'redirect')
          res.writeHead(301, {'location': '/redirect2'})
          res.end()
        }
        else if (req.url === '/redirect2') {
          console.server(req.headers, 'redirect')
          res.writeHead(301, {'location': '/'})
          res.end()
        }
        else {
          console.server(req.headers, 'response')
          req.on('data', function (data) {
            console.server('data')
          })
          res.writeHead(200, {'content-encoding': 'deflate'})
          req.pipe(zlib.createDeflate()).pipe(res)
        }
      })
      server.listen(6767, done)
    })

    it('2', function (done) {
      var input = fs.createReadStream(image2, {highWaterMark: 1024})
        , output = fs.createWriteStream(tmp)

      var req = request({
        method: 'POST',
        url: 'http://localhost:6767/redirect1',
        gzip: true,
        redirect: {all: true}
      })

      input
        .pipe(req)
        .pipe(output)

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

  describe('stream file + callback', function () {
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

    it('3', function (done) {
      var input = fs.createReadStream(image2, {highWaterMark: 1024})

      var req = request({
        method: 'POST',
        url: 'http://localhost:6767/redirect',
        encoding: 'binary',
        redirect: {all: true},
        callback: function (err, res, body) {
          fs.writeFileSync(tmp, body)
          var stats = fs.statSync(tmp)
          stats.size.should.equal(22025)
          done()
        }
      })

      req.on('response', function (res) {
        console.client(res.headers)
      })

      input.pipe(req)
    })

    after(function (done) {
      server.close(done)
    })
  })

  describe('callback without streaming', function () {
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
          var input = fs.createReadStream(image2, {highWaterMark: 1024})
          input.on('data', function (data) {
            console.server('data')
          })
          input.pipe(res)
        }
      })
      server.listen(6767, done)
    })

    it('4', function (done) {
      var req = request({
        url: 'http://localhost:6767/redirect',
        redirect: true,
        encoding: 'binary',
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

  describe('body file', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        if (req.url === '/redirect') {
          console.server('redirect %o', req.headers)
          res.writeHead(301, {'location': '/'})
          res.end()
        }
        else {
          console.server('response %o', req.headers)
          req.on('data', function (chunk) {
            console.server('data')
          })
          req.pipe(res)
        }
      })
      server.listen(6767, done)
    })

    it('5', function (done) {
      var input = fs.readFileSync(image2)

      var req = request({
        method: 'POST',
        url: 'http://localhost:6767/redirect',
        body: input,
        encoding: 'binary',
        redirect: {all: true},
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

  describe('body buffer', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        if (req.url === '/redirect') {
          console.server('redirect %o', req.headers)
          res.writeHead(301, {'location': '/'})
          res.end()
        }
        else {
          console.server('response %o', req.headers)
          req.on('data', function (chunk) {
            console.server('data')
          })
          req.pipe(res)
        }
      })
      server.listen(6767, done)
    })

    it('6', function (done) {
      var input = fs.readFileSync(image2)

      var req = request({
        method: 'POST',
        url: 'http://localhost:6767/redirect',
        body: Buffer('poop'),
        redirect: {all: true},
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

  describe('manually stream file', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        if (req.url === '/redirect') {
          console.server('redirect %o', req.headers)
          res.writeHead(301, {'location': '/'})
          res.end()
        }
        else {
          console.server('response %o', req.headers)
          req.on('data', function (data) {
            console.server('data')
          })
          req.pipe(res)
        }
      })
      server.listen(6767, done)
    })

    it('7', function (done) {
      var input = fs.createReadStream(image2, {highWaterMark: 1024})
        , output = fs.createWriteStream(tmp)

      var req = request({
        method: 'POST',
        url: 'http://localhost:6767/redirect',
        redirect: {all: true},
        end: false
      })

      input.on('readable', function () {
        var chunk = input.read()
        if (chunk) {
          req.write(chunk)
        }
        else {
          req.end()
        }
      })
      req.on('readable', function () {
        var chunk = req.read()
        if (chunk) {
          output.write(chunk)
        }
        else {
          output.end()
        }
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

  describe('resend authorization header', function () {
    var server, redirects = 0
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.server('redirect %o', req.headers)
        req.headers.authorization.should.equal('OAuth poop')
        redirects++
        if (req.url === '/redirect') {
          res.writeHead(301, {'location': '/'})
        }
        res.end()
      })
      server.listen(6767, done)
    })

    it('8', function (done) {
      var input = fs.readFileSync(image2)

      var req = request({
        url: 'http://localhost:6767/redirect',
        headers: {authorization: 'OAuth poop'},
        redirect: true,
        callback: function (err, res, body) {
          redirects.should.equal(2)
          done()
        }
      })
    })

    after(function (done) {
      server.close(done)
    })
  })

  describe('remove authorization on hostname change', function () {
    var server, server2
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.server('redirect %o', req.headers)
        req.headers.authorization.should.equal('Basic poop')
        res.writeHead(301, {'location': 'http://dummy.com:6768'})
        res.end()
      })
      server.listen(6767, 'localhost', function () {

        server2 = http.createServer()
        server2.on('request', function (req, res) {
          console.server('redirect %o', req.headers)
          should.equal(req.headers.authorization, undefined)
          req.headers.referer.should.equal('http://localhost:6767/')
          res.end()
        })
        server2.listen(6768, 'dummy.com', done)
      })
    })

    it('9', function (done) {
      var input = fs.readFileSync(image2)

      var req = request({
        url: 'http://localhost:6767',
        headers: {authorization: 'Basic poop'},
        redirect: true,
        callback: function (err, res, body) {
          done()
        }
      })
    })

    after(function (done) {
      server.close(function () {
        server2.close(done)
      })
    })
  })

  describe('set max redirects to follow', function () {
    var server, redirects = 0
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.server('redirect %o', req.headers)
        redirects++
        res.writeHead(301, {'location': '/'})
        res.end()
      })
      server.listen(6767, 'localhost', done)
    })

    it('10', function (done) {
      var req = request({
        url: 'http://localhost:6767',
        redirect: {max: 3},
        callback: function (err, res, body) {
          redirects.should.equal(3)
          done()
        }
      })
    })

    after(function (done) {
      server.close(done)
    })
  })

  describe('do not follow 401 redirect ' +
    'when basic/bearer auth is already sent', function () {
    var server, redirects = 0
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.server('redirect %o', req.headers)
        redirects++
        res.writeHead(401, {})
        res.end()
      })
      server.listen(6767, 'localhost', done)
    })

    it('11', function (done) {
      var req = request({
        url: 'http://localhost:6767',
        auth: {bearer: 'token'},
        redirect: true,
        callback: function (err, res, body) {
          redirects.should.equal(1)
          done()
        }
      })
    })

    after(function (done) {
      server.close(done)
    })
  })

})
