
if (!process.argv[2]) {console.log('Specify example to run'); process.exit()}

var fs = require('fs')
  , path = require('path')
  , http = require('http')
  , iconv = require('iconv-lite')
var Request = require('./index')


var server = http.createServer()
server.on('request', function (req, res) {
  console.log(req.headers)
  res.writeHead(200, {})
  // ISO-8859-1
  // transfer the characters with wrong encoding
  res.end('Pathé Chamnord Ç, ç, Ð, ð', 'ascii')
})
server.listen(6767)


var examples = {
  0: function () {
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
        'transfer-encoding': 'chunked'
      }
    })

    request
      .on('response', function (res) {
        console.log('res')
        // probably should detect the content encoding somehow

        request._res = res.pipe(iconv.decodeStream('ISO-8859-1'))
      })
      .pipe(process.stdout)

    request.end()
  }
}

examples[process.argv[2]]()
