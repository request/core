
if (!process.argv[2]) {console.log('Specify example to run'); process.exit()}

var fs = require('fs')
  , path = require('path')
  , http = require('http')
  , zlib = require('zlib')
var request = require('./index')


var server = http.createServer()
server.on('request', function (req, res) {
  if (req.url === '/redirect') {
    console.log('redirect')
    res.writeHead(301, {'location': '/'})
    res.end()
  } else {
    console.log('send')
    req.on('data', function (data) {
      console.log('write')
    })
    req.pipe(res)
  }
})
server.listen(6767)


var image = path.join(__dirname, 'fixtures/cat.png')
  , image2 = path.join(__dirname, 'tmp/cat2.png')

var input = fs.createReadStream(image)
  , output = fs.createWriteStream(image2)


var examples = {

  0: function () {
    var input = fs.createReadStream(path.join(__dirname, 'fixtures/cat.png'), {
      highWaterMark: 1024
    })
    var output = fs.createWriteStream(path.join(__dirname, 'tmp/cat2.png'))

    var req = request({
      protocol: 'http:',
      method: 'GET',
      host: 'localhost',
      port: 6767,
      path: '/redirect',
      headers: {
        'transfer-encoding': 'chunked'
      },
      redirect: true
    })

    req.on('error', function (err) {
      console.log(err)
    })

    input
      .pipe(req)
      .pipe(output)
  }

  // test with gzip
  // test without pipe
}

examples[process.argv[2]]()
