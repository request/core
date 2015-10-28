
var Headers = require('@http/headers')
var requestOptions = require('../config/options')


exports.filter = function (options) {
  var result = {}

  for (var key in options) {
    if (requestOptions.indexOf(key) === -1) {
      result[key] = options[key]
    }
  }

  // transform
  result.headers = result.headers.toObject()

  if (options.proxy && !options.tunnel) {
    result.protocol = options.proxy.protocol
    result.hostname = options.proxy.hostname
    result.port = options.proxy.port
  }
  else {
    result.protocol = options.url.protocol
    result.hostname = options.url.hostname
    result.port = options.url.port
  }

  result.path = options.url.path

  if (result.protocol.indexOf(':') === -1) {
    result.protocol = result.protocol + ':'
  }

  return result
}

exports.rfc3986 = function (str) {
  return str.replace(/[!'()*]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}
