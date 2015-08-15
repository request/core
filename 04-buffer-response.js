
if (!process.argv[2]) {console.log('Specify example to run'); process.exit()}

var fs = require('fs')
  , path = require('path')
  , http = require('http')
  , bl = require('bl')
var Request = require('./index')


var server = http.createServer()
server.on('request', function (req, res) {
  console.log(req.headers)
  // res.writeHead(200, {})
  req.pipe(res)
})
server.listen(6767)


var examples = {
  0: function () {
    var input = fs.createReadStream(path.join(__dirname, 'fixtures/cat.png'))
      , output = path.join(__dirname, 'tmp/cat2.png')

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

    var buffer = bl()
    input
      .pipe(
        request.on('data', function (chunk) {
          console.log('data')
          buffer.append(chunk)
        })
        .on('end', function () {
          // binary
          fs.writeFileSync(output, buffer.slice())
          // string
          // fs.writeFileSync(output, buffer.toString('some encoding'))
        }))
  }
}

examples[process.argv[2]]()
