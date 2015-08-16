
if (!process.argv[2]) {console.log('Specify example to run'); process.exit()}

var fs = require('fs')
  , path = require('path')
  , http = require('http')
  , bl = require('bl')
var request = require('./index')


var server = http.createServer()
server.on('request', function (req, res) {
  if (req.headers['accept'] === 'text/plain') {
    res.end('poop')
  } else {
    req.pipe(res)
  }
})
server.listen(6767)


var input = fs.createReadStream(path.join(__dirname, 'fixtures/cat.png'))
  , output = path.join(__dirname, 'tmp/cat2.png')

var examples = {

  // buffer externally
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

    var buffer = bl()
    req.on('data', function (chunk) {
      buffer.append(chunk)
    })
    .on('end', function () {
      // binary
      fs.writeFileSync(output, buffer.slice())
      // string
      // fs.writeFileSync(output, buffer.toString('some encoding'))
    })

    input
      .pipe(req)
  },

  // buffer using buffer-response module
  1: function () {
    // regular http options
    // except: protocol, encoding, callback
    var req = request({
      protocol: 'http:',
      method: 'GET',
      host: 'localhost',
      port: 6767,
      path: '/',
      headers: {
        'transfer-encoding': 'chunked'
      },
      encoding: 'binary',
      callback: function (err, res, body) {
        fs.writeFileSync(output, body)
      }
    })

    input
      .pipe(req)
  },

  // buffer string using buffer-response module
  2: function () {
    // regular http options
    // except: protocol, encoding, callback
    var req = request({
      protocol: 'http:',
      method: 'GET',
      host: 'localhost',
      port: 6767,
      path: '/',
      headers: {
        'accept': 'text/plain',
        'transfer-encoding': 'chunked'
      },
      callback: function (err, res, body) {
        console.log(body)
      }
    })

    req.end()
  }
}

examples[process.argv[2]]()
