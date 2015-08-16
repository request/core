
if (!process.argv[2]) {console.log('Specify example to run'); process.exit()}

var fs = require('fs')
  , path = require('path')
  , http = require('http')
  , zlib = require('zlib')
  , iconv = require('iconv-lite')
var request = require('./index')


var server = http.createServer()
server.on('request', function (req, res) {
  res.writeHead(200, {'content-encoding': 'deflate'})
  var buff = new Buffer('Pathé Chamnord Ç, ç, Ð, ð', 'ascii')
  res.end(zlib.deflateSync(buff))
})
server.listen(6767)


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

    req
      .pipe(zlib.createInflate())
      .pipe(iconv.decodeStream('ISO-8859-1'))
      .pipe(process.stdout)

    req.end()
  },

  // piping it using the gzip and encoding stream module
  1: function () {
    // regular http options
    // except: protocol, gzip, encoding
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
      gzip: true,
      encoding: 'ISO-8859-1'
    })

    req
      .pipe(process.stdout)

    req.end()
  }
}

examples[process.argv[2]]()
