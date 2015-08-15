
if (!process.argv[2]) {console.log('Specify example to run'); process.exit()}

var fs = require('fs')
  , path = require('path')
  , http = require('http')
var Request = require('./index')


var server = http.createServer()
server.on('request', function (req, res) {
  req.pipe(res)
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
        'transfer-encoding': 'chunked'
      }
    })

    input
      .pipe(request)
      .pipe(output)
  }
}

examples[process.argv[2]]()
