
var bl = require('bl')
var utils = require('../lib/utils')


function callback (req, options) {
  var buffer = bl()
    , encoding = options.encoding
    , callback = options.callback

  var _res
  req.on('response', function (res) {
    _res = res
  })

  req.on('data', function (chunk) {
    buffer.append(chunk)
  })

  req.on('end', function () {
    var body
    if (encoding === 'binary') {
      // binary
      body = buffer.slice()
    }
    else {
      // string
      body = buffer.toString()
      // json
      if (utils.isJSON(_res)) {
        // jsonp
        if (utils.isJSONP(body)) {
          body = utils.parseJSONP(body)
        }
        if (typeof body === 'string') {
          try {
            body = JSON.parse(body)
          }
          catch (err) {
            req.emit('callback: JSON parse error!')
          }
        }
      }
    }
    callback(null, _res, body)
  })
}

module.exports = callback
