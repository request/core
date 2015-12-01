
var fs = require('fs')
  , path = require('path')
  , http = require('http')
var should = require('should')
  , debug = require('debug')
  , formidable = require('formidable')
  , _request = require('request')
var request = require('@request/client')

var image0 = path.join(__dirname, './fixtures/cat0.png')
  , image1 = path.join(__dirname, './fixtures/cat1.png')
  , image2 = path.join(__dirname, './fixtures/cat2.png')
var tmp = path.join(__dirname, './tmp/cat.png')

console.server = debug('server')
console.client = debug('client')


describe('- content-length', function () {

  describe('pipe fs + length + pipe fs', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.server(req.headers)
        parseInt(req.headers['content-length']).should.equal(22025)
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
        length: true
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

  describe('pipe request + length + pipe fs', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        if (req.url === '/download') {
          console.server('download %o', req.headers)
          var image = fs.createReadStream(image2, {highWaterMark: 1024})
          res.writeHead(200, {'content-length': 22025})
          image.pipe(res)
        }
        else {
          console.server('upload %o', req.headers)
          parseInt(req.headers['content-length']).should.equal(22025)
          req.pipe(res)
        }
      })
      server.listen(6767, done)
    })

    it('1', function (done) {
      var download = _request({
        url: 'http://localhost:6767/download',
        encoding: null
      })
      var upload = request({
        method: 'POST',
        url: 'http://localhost:6767',
        length: true,
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

  describe('pipe request-next + length + pipe fs', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        if (req.url === '/download') {
          console.server('download %o', req.headers)
          var image = fs.createReadStream(image2, {highWaterMark: 1024})
          res.writeHead(200, {'content-length': 22025})
          image.pipe(res)
        }
        else {
          console.server('upload %o', req.headers)
          parseInt(req.headers['content-length']).should.equal(22025)
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
        method: 'POST',
        url: 'http://localhost:6767',
        length: true,
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


  describe('body file stream + length + pipe fs', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.server(req.headers)
        parseInt(req.headers['content-length']).should.equal(22025)
        req.pipe(res)
      })
      server.listen(6767, done)
    })

    it('3', function (done) {
      var input = fs.createReadStream(image2, {highWaterMark: 1024})
        , output = fs.createWriteStream(tmp)

      var req = request({
        method: 'POST',
        url: 'http://localhost:6767',
        body: input,
        length: true
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

  describe('body request stream + length + pipe fs', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        if (req.url === '/download') {
          console.server('download %o', req.headers)
          var image = fs.createReadStream(image2, {highWaterMark: 1024})
          res.writeHead(200, {'content-length': 22025})
          image.pipe(res)
        }
        else {
          console.server('upload %o', req.headers)
          parseInt(req.headers['content-length']).should.equal(22025)
          req.pipe(res)
        }
      })
      server.listen(6767, done)
    })

    it('4', function (done) {
      var download = _request({
        url: 'http://localhost:6767/download',
        encoding: null
      })
      var upload = request({
        method: 'POST',
        url: 'http://localhost:6767',
        body: download,
        length: true,
        encoding: 'binary'
      })
      var output = fs.createWriteStream(tmp)

      upload
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

  describe('body request-next stream + length + pipe fs', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        if (req.url === '/download') {
          console.server('download %o', req.headers)
          var image = fs.createReadStream(image2, {highWaterMark: 1024})
          res.writeHead(200, {'content-length': 22025})
          image.pipe(res)
        }
        else {
          console.server('upload %o', req.headers)
          parseInt(req.headers['content-length']).should.equal(22025)
          req.pipe(res)
        }
      })
      server.listen(6767, done)
    })

    it('5', function (done) {
      var download = request({
        url: 'http://localhost:6767/download',
        encoding: null
      })
      var upload = request({
        method: 'POST',
        url: 'http://localhost:6767',
        body: download,
        length: true,
        encoding: 'binary'
      })
      var output = fs.createWriteStream(tmp)

      upload
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


  describe('body file buffer + length + callback', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.server(req.headers)
        parseInt(req.headers['content-length']).should.equal(22025)
        req.pipe(res)
      })
      server.listen(6767, done)
    })

    it('6', function (done) {
      var input = fs.readFileSync(image2)

      var req = request({
        method: 'POST',
        url: 'http://localhost:6767',
        body: input,
        encoding: 'binary',
        length: true,
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

  describe('body string + length + callback', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.server(req.headers)
        parseInt(req.headers['content-length']).should.equal(4)
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
        length: true,
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

  describe('body array + length + callback', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.server(req.headers)
        parseInt(req.headers['content-length']).should.equal(14)
        req.pipe(res)
      })
      server.listen(6767, done)
    })

    it('8', function (done) {
      var req = request({
        method: 'POST',
        url: 'http://localhost:6767',
        body: ['amazing', 'wqw', 'poop'],
        length: true,
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


  describe('multipart/related + file stream', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.server(req.headers)
        parseInt(req.headers['content-length']).should.equal(22134)
        var form = new formidable.IncomingForm()
        form.parse(req, function (err, fields, files) {})
        form.onPart = function (part) {
          part.pipe(res)
        }
      })
      server.listen(6767, done)
    })

    it('9', function (done) {
      var input = fs.createReadStream(image2, {highWaterMark: 1024})

      var req = request({
        method: 'POST',
        url: 'http://localhost:6767',
        encoding: 'binary',
        multipart: [
          {
            'Content-Type': 'image/png',
            body: input
          }
        ],
        length: true,
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

  describe('multipart/related + request-next stream', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        if (req.url === '/download') {
          console.server('download %o', req.headers)
          var image = fs.createReadStream(image2, {highWaterMark: 1024})
          image.on('data', function (chunk) {
            console.server('download chunk')
          })
          res.writeHead(200, {'content-length': 22025})
          image.pipe(res)
        }
        else {
          console.server('upload %o', req.headers)
          parseInt(req.headers['content-length']).should.equal(22134)
          var form = new formidable.IncomingForm()
          form.parse(req, function (err, fields, files) {})
          form.onPart = function (part) {
            part.on('data', function (chunk) {
              console.server('response chunk')
            })
            part.pipe(res)
          }
        }
      })
      server.listen(6767, done)
    })

    it('10', function (done) {
      var input = request({
        method: 'GET',
        url: 'http://localhost:6767/download',
        encoding: 'binary'
      })

      var req = request({
        method: 'POST',
        url: 'http://localhost:6767',
        encoding: 'binary',
        multipart: [
          {
            'Content-Type': 'image/png',
            body: input
          }
        ],
        length: true,
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


  describe('body stream + content-length header', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.server(req.headers)
        req.pipe(res)
      })
      server.listen(6767, done)
    })

    it('11', function (done) {
      var input = fs.createReadStream(image2, {highWaterMark: 1024})
        , output = fs.createWriteStream(tmp)

      var req = request({
        method: 'POST',
        url: 'http://localhost:6767',
        headers: {
          'content-length': 22025
        },
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

  describe('body buffer + content-length header', function () {
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

    it('12', function (done) {
      var req = request({
        method: 'POST',
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

})
