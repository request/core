
var bl = require('bl')
var parse = require('./parse')


exports.request = function (req, options) {
  var buffer = bl()
    , encoding = options.encoding
    , callback = options.callback

  req.on('error', options.callback.bind(req))

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
      req.emit('body', body)
    }
    else {
      // string
      body = buffer.toString()
      req.emit('body', body)

      // json
      if (options.parse.json /*&& parse.isJSON(_res)*/) {
        // jsonp
        if (parse.isJSONP(body)) {
          body = parse.parseJSONP(body)
        }
        if (typeof body === 'string') {
          try {
            body = JSON.parse(body, options.parse.json)
          }
          catch (err) {
            req.emit('callback: JSON parse error!')
          }
        }
        req.emit('json', body)
      }
    }
    callback(null, _res, body)
  })
}
