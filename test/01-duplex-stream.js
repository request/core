
var fs = require('fs')
  , path = require('path')
  , http = require('http')
var should = require('should')
  , debug = require('debug')
var request = require('../index')

var image0 = path.join(__dirname, './fixtures/cat0.png')
  , image1 = path.join(__dirname, './fixtures/cat1.png')
  , image2 = path.join(__dirname, './fixtures/cat2.png')
var tmp = path.join(__dirname, './tmp/cat.png')

console.server = debug('server')
console.client = debug('client')


describe('- duplex-stream', function () {

  describe('pipe: fs + request + fs', function () {
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
        method: 'GET',
        host: 'localhost',
        port: 6767,
        path: '/',

        protocol: 'http'
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

  describe('pipe: fs + request + request + fs', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.server(req.headers)
        req.pipe(res)
      })
      server.listen(6767, done)
    })

    it('1', function (done) {
      var input = fs.createReadStream(image2, {highWaterMark: 1024})
        , output = fs.createWriteStream(tmp)

      var req1 = request({
        url: 'http://localhost:6767'
      })
      var req2 = request({
        url: 'http://localhost:6767'
      })

      input
        .pipe(req1)
        .pipe(req2)
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

  describe('pipe: request + request + fs', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        if (req.url === '/download') {
          console.server('download %o', req.headers)
          var image = fs.createReadStream(image2, {highWaterMark: 1024})
          image.pipe(res)
        }
        else {
          console.server('upload %o', req.headers)
          req.pipe(res)
        }
      })
      server.listen(6767, done)
    })

    it('2', function (done) {
      var download = request({
        url: 'http://localhost:6767/download',
        encoding: 'binary'
      })
      var upload = request({
        url: 'http://localhost:6767',
        encoding: 'binary'
      })
      var output = fs.createWriteStream(tmp)

      download
        .pipe(upload)
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


  describe('manual read + pipe to fs', function () {
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
      var input = fs.createReadStream(image2, {highWaterMark: 1024})
        , output = fs.createWriteStream(tmp)

      var req = request({
        url: 'http://localhost:6767',
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

  describe('manual read and manual write', function () {
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
      var input = fs.createReadStream(image2, {highWaterMark: 1024})
        , output = fs.createWriteStream(tmp)

      var req = request({
        url: 'http://localhost:6767',
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

})
