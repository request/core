
var url = require('url')
var dcopy = require('deep-copy')
var reqOptions = require('../config/options')


exports.init = function (options) {
  // options = dcopy(options)
  options.headers = options.headers || {}

  var uri = options.url || options.uri
  if (typeof uri === 'string' && uri) {
    uri = url.parse(uri)
    options.protocol = uri.protocol
    options.host = uri.hostname
    options.port = uri.port
    options.path = uri.path
  }

  return options
}

exports.filter = function (options) {
  var result = {}

  for (var key in options) {
    if (reqOptions.indexOf(key) === -1) {
      result[key] = options[key]
    }
  }

  return result
}
