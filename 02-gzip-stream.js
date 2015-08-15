
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


var examples = {
  0: function () {
    var input = fs.createReadStream(path.join(__dirname, 'fixtures/cat.png'))
      , output = fs.createWriteStream(path.join(__dirname, 'tmp/cat2.png'))

    // regular http options (except protocol)
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
      // piping it externally
      // .pipe(zlib.createInflate())
      .pipe(output)
  }
}

examples[process.argv[2]]()
