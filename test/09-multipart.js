
var fs = require('fs')
  , path = require('path')
  , http = require('http')
  , zlib = require('zlib')
var should = require('should')
  , debug = require('debug')
  , bl = require('bl')
  , formidable = require('formidable')
var request = require('request-client')

var image0 = path.join(__dirname, './fixtures/cat0.png')
  , image1 = path.join(__dirname, './fixtures/cat1.png')
  , image2 = path.join(__dirname, './fixtures/cat2.png')
var tmp = path.join(__dirname, './tmp/cat.png')

console.server = debug('server')
console.client = debug('client')


describe('- multipart', function () {

  describe('multipart/related - stream one file', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.server(req.headers)
        var form = new formidable.IncomingForm()
        // form.uploadDir = path.join(__dirname, 'tmp')
        // form.on('fileBegin', function (name, file) {})

        form.parse(req, function (err, fields, files) {})
        form.onPart = function (part) {
          part.pipe(res)
        }
      })
      server.listen(6767, done)
    })

    it('0', function (done) {
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

  describe('multipart/related - request one file', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        if (req.url === '/download') {
          console.server(req.headers, 'download')
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

    it('1', function (done) {
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

  describe('multipart/related - buffer one file', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.server(req.headers)
        var form = new formidable.IncomingForm()
        form.parse(req, function (err, fields, files) {})
        form.onPart = function (part) {
          part.on('data', function (chunk) {
            console.server('data')
          })
          part.pipe(res)
        }
      })
      server.listen(6767, done)
    })

    it('2', function (done) {
      var input = fs.readFileSync(image2)

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

  describe('multipart/related - buffer one string', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.server(req.headers)
        var form = new formidable.IncomingForm()
        form.parse(req, function (err, fields, files) {})
        form.onPart = function (part) {
          part.on('data', function (chunk) {
            console.server('data')
          })
          part.pipe(res)
        }
      })
      server.listen(6767, done)
    })

    it('3', function (done) {
      var req = request({
        method: 'POST',
        url: 'http://localhost:6767',
        multipart: [
          {
            'Content-Type': 'text/plain',
            body: 'poop'
          }
        ],
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

  describe('multipart/form-data - stream one file', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        console.server(req.headers)
        var form = new formidable.IncomingForm()
        form.parse(req, function (err, fields, files) {})
        form.onPart = function (part) {
          if (part.name === 'file') {
            part.pipe(res)
          }
        }
      })
      server.listen(6767, done)
    })

    it('4', function (done) {
      var input = fs.createReadStream(image2, {highWaterMark: 1024})

      var req = request({
        method: 'PUT',
        url: 'http://localhost:6767',
        encoding: 'binary',
        multipart: {
          message: 'poop',
          file: input
        },
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

})
