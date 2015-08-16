
if (!process.argv[2]) {console.log('Specify example to run'); process.exit()}

var fs = require('fs')
  , path = require('path')
  , http = require('http')
  , zlib = require('zlib')
var request = require('./index')


var server = http.createServer()
server.on('request', function (req, res) {
  res.writeHead(200, {'content-encoding': 'deflate'})
  req.pipe(zlib.createDeflate()).pipe(res)
})
server.listen(6767)


var input = fs.createReadStream(path.join(__dirname, 'fixtures/cat.png'))
  , output = fs.createWriteStream(path.join(__dirname, 'tmp/cat2.png'))

var examples = {

  // piping it externally
  0: function () {
    // regular http options
    // except: protocol
    var req = request({
      protocol: 'http:',
      method: 'GET',
      host: 'localhost',
      port: 6767,
      path: '/',
      headers: {
        'transfer-encoding': 'chunked',
        'accept-encoding': 'gzip,deflate'
      }
    })

    input
      .pipe(req)
      .pipe(zlib.createInflate())
      .pipe(output)
  },

  // piping it using external on.response event
  1: function () {
    // regular http options
    // except: protocol
    var req = request({
      protocol: 'http:',
      method: 'GET',
      host: 'localhost',
      port: 6767,
      path: '/',
      headers: {
        'transfer-encoding': 'chunked',
        'accept-encoding': 'gzip,deflate'
      }
    })
    req.on('response', function (res) {
      var encoding = res.headers['content-encoding'] || 'identity'
      var decompress = null
      if (encoding.match(/\bdeflate\b/)) {
        decompress = zlib.createInflate()
      } else if (encoding.match(/\bgzip\b/)) {
        decompress = zlib.createGunzip()
      }
      req._res = res.pipe(decompress)
    })

    input
      .pipe(req)
      .pipe(output)
  },

  // piping it using the gzip-stream module
  2: function () {
    // regular http options
    // except: protocol, gzip
    var req = request({
      protocol: 'http:',
      method: 'GET',
      host: 'localhost',
      port: 6767,
      path: '/',
      headers: {
        'transfer-encoding': 'chunked',
        'accept-encoding': 'gzip,deflate'
      },
      gzip: true
    })

    input
      .pipe(req)
      .pipe(output)
  }
}

examples[process.argv[2]]()
