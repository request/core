
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

console.debug = debug('server')


describe('- duplex-stream', function () {

  describe('pipe duplex stream', function () {
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

})
