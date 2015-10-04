
var bl = require('bl')
var utils = require('../utils')


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
      req.emit('callback', body)
    }
    else {
      // string
      body = buffer.toString()
      req.emit('callback', body)
      if (options.parse.json) {
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
          req.emit('json', body)
        }
      }
    }
    callback(null, _res, body)
  })
}

module.exports = callback
