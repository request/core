
var fs = require('fs')
  , path = require('path')
  , http = require('http')
var should = require('should')
  , debug = require('debug')
var request = require('../index')

var image = path.join(__dirname, './fixtures/cat.png')
  , image2 = path.join(__dirname, './tmp/cat2.png')

console.debug = debug('server')


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
    var input = fs.createReadStream(image, {
      highWaterMark: 1024
    })
    var output = fs.createWriteStream(image2)

    var req = request({
      method: 'GET',
      host: 'localhost',
      port: 6767,
      path: '/',
      headers: {
        'transfer-encoding': 'chunked'
      },

      protocol: 'http'
    })

    input
      .pipe(req)
      .pipe(output)

    output.on('close', function () {
      var stats = fs.statSync(image2)
      stats.size.should.equal(22025)
      done()
    })
  })

  after(function (done) {
    server.close(done)
  })
})
