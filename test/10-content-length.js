
var fs = require('fs')
  , path = require('path')
  , http = require('http')
var should = require('should')
  , debug = require('debug')
  , formidable = require('formidable')
var request = require('../index')

var image0 = path.join(__dirname, './fixtures/cat0.png')
  , image1 = path.join(__dirname, './fixtures/cat1.png')
  , image2 = path.join(__dirname, './fixtures/cat2.png')
var tmp = path.join(__dirname, './tmp/cat.png')

console.server = debug('server')
console.client = debug('client')


describe('- content-length', function () {

  describe('pipe + contentLength + pipe', function () {
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
        url: 'http://localhost:6767',
        contentLength: true
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

  describe('body file stream + contentLength + pipe', function () {
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

    it('1', function (done) {
      var input = fs.createReadStream(image2, {highWaterMark: 1024})
        , output = fs.createWriteStream(tmp)

      var req = request({
        url: 'http://localhost:6767',
        body: input,
        contentLength: true
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

  describe('body file buffer + contentLength + callback', function () {
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

    it('2', function (done) {
      var input = fs.readFileSync(image2)

      var req = request({
        url: 'http://localhost:6767',
        body: input,
        encoding: 'binary',
        contentLength: true,
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

  describe('body string + contentLength + callback', function () {
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

    it('3', function (done) {
      var req = request({
        url: 'http://localhost:6767',
        body: 'poop',
        contentLength: true,
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

  describe('body array + contentLength + callback', function () {
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

    it('4', function (done) {
      var req = request({
        url: 'http://localhost:6767',
        body: ['amazing', 'wqw', 'poop'],
        contentLength: true,
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

  describe('multipart/related - stream one file', function () {
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

    it('5', function (done) {
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
        contentLength: true,
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

  describe.skip('multipart/related - request one file', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        if (req.url === '/download') {
          console.server(req.headers, 'download')
          parseInt(req.headers['content-length']).should.equal(22134)
          var image = fs.createReadStream(image2, {highWaterMark: 1024})
          image.on('data', function (chunk) {
            console.server('download chunk')
          })
          image.pipe(res)
        }
        else {
          console.server(req.headers, 'upload')
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

    it('6', function (done) {
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
        contentLength: true,
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

    it('7', function (done) {
      var input = fs.createReadStream(image2, {highWaterMark: 1024})
        , output = fs.createWriteStream(tmp)

      var req = request({
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

    it('8', function (done) {
      var req = request({
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
