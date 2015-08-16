
if (!process.argv[2]) {console.log('Specify example to run'); process.exit()}

var fs = require('fs')
  , path = require('path')
  , http = require('http')
  , iconv = require('iconv-lite')
var request = require('./index')


var server = http.createServer()
server.on('request', function (req, res) {
  res.writeHead(200, {})
  // ISO-8859-1
  // transfer the characters with wrong encoding
  res.end('Pathé Chamnord Ç, ç, Ð, ð', 'ascii')
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
        'transfer-encoding': 'chunked'
      }
    })

    req
      .pipe(iconv.decodeStream('ISO-8859-1'))
      .pipe(process.stdout)

    req.end()
  },

  // piping it externally
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
        'transfer-encoding': 'chunked'
      }
    })
    req.on('response', function (res) {
      // probably should detect the content encoding somehow
      req._res = res.pipe(iconv.decodeStream('ISO-8859-1'))
    })

    req.pipe(process.stdout)

    req.end()
  },

  // piping it using the encoding-stream module
  2: function () {
    // regular http options
    // except: protocol
    var req = request({
      protocol: 'http:',
      method: 'GET',
      host: 'localhost',
      port: 6767,
      path: '/',
      headers: {
        'transfer-encoding': 'chunked'
      },
      encoding: 'ISO-8859-1'
    })

    req.pipe(process.stdout)

  }
}

examples[process.argv[2]]()
