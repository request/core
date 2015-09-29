
var http = require('http')
  , url = require('url')
var dcopy = require('deep-copy')
var Headers = require('request-headers')
var coreOptions = require('../config/defaults')
  , requestOptions = require('../config/options')


exports.filter = function (options) {
  var result = {}

  for (var key in options) {
    if (requestOptions.indexOf(key) === -1) {
      result[key] = options[key]
    }
  }
  result.headers = result.headers.toObject()

  return result
}

exports.response = function (res) {
  res.headers = new Headers(res.headers)
}

exports.rfc3986 = function (str) {
  return str.replace(/[!'()*]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

exports.isJSON = function (res, body) {
  var encoding = res.headers.get('content-encoding')
    , type = res.headers.get('content-type')

  if (
    (typeof body === 'string' && body.trim()) &&
    (/json/.test(encoding) || /json|javascript/.test(type))) {
    // jsonp
    // if (/[^(]+\(([\s\S]+)\)/.test(body)) {
    //   body = body.replace(/[^(]+\(([\s\S]+)\)/, '$1')
    // }
    return true
  }
}
