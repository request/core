
if (!process.argv[2]) {console.log('Specify example to run'); process.exit()}

var fs = require('fs')
  , path = require('path')
  , http = require('http')
  , zlib = require('zlib')
var Request = require('./index')


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

    var request = new Request({
      url: 'http://localhost:6767'
    })
    // regular http options
    request.start({
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
      .pipe(request.on('response', function (res) {
        var encoding = res.headers['content-encoding'] || 'identity'
        console.log(encoding)
        var decompress = null
        if (encoding.match(/\bdeflate\b/)) {
          decompress = zlib.createInflate()
        } else if (encoding.match(/\bgzip\b/)) {
          decompress = zlib.createGunzip()
        }
        request._res = res.pipe(decompress)
      }))
      // piping it externally
      // .pipe(zlib.createInflate())
      .pipe(output)
  }
}

examples[process.argv[2]]()
