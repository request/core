
if (!process.argv[2]) {console.log('Specify example to run'); process.exit()}

var fs = require('fs')
  , path = require('path')
  , http = require('http')
  , bl = require('bl')
var request = require('./index')


var server = http.createServer()
server.on('request', function (req, res) {
  req.pipe(res)
})
server.listen(6767)


var examples = {
  0: function () {
    var input = fs.createReadStream(path.join(__dirname, 'fixtures/cat.png'))
      , output = path.join(__dirname, 'tmp/cat2.png')

    // regular http options (except protocol)
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
  }
}

examples[process.argv[2]]()
