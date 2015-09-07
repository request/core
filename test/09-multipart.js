
var fs = require('fs')
  , path = require('path')
  , http = require('http')
  , zlib = require('zlib')
var should = require('should')
  , debug = require('debug')
  , bl = require('bl')
  , formidable = require('formidable')
var request = require('../index')

var image0 = path.join(__dirname, './fixtures/cat0.png')
  , image1 = path.join(__dirname, './fixtures/cat1.png')
  , image2 = path.join(__dirname, './fixtures/cat2.png')
var tmp = path.join(__dirname, './tmp/cat.png')

console.debug = debug('server')


describe('- multipart', function () {

  describe('multipart/related - 1 file', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
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
        method: 'GET',
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

  describe.skip('', function () {
    var server
    before(function (done) {

    })

    it('', function (done) {

    })

    after(function (done) {
      server.close(done)
    })
  })

  describe.skip('', function () {
    var server
    before(function (done) {

    })

    it('', function (done) {

    })

    after(function (done) {
      server.close(done)
    })
  })

  describe.skip('', function () {
    var server
    before(function (done) {

    })

    it('', function (done) {

    })

    after(function (done) {
      server.close(done)
    })
  })

  describe.skip('', function () {
    var server
    before(function (done) {

    })

    it('', function (done) {

    })

    after(function (done) {
      server.close(done)
    })
  })

  describe.skip('', function () {
    var server
    before(function (done) {

    })

    it('', function (done) {

    })

    after(function (done) {
      server.close(done)
    })
  })

})
