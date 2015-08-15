
if (!process.argv[2]) {console.log('Specify example to run'); process.exit()}

var fs = require('fs')
  , path = require('path')
  , http = require('http')
var request = require('./index')


var server = http.createServer()
server.on('request', function (req, res) {
  req.pipe(res)
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
        'transfer-encoding': 'chunked'
      }
    })

    input
      .pipe(req)
      .pipe(output)
  }
}

examples[process.argv[2]]()
