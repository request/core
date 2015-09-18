
var http = require('http')
  , url = require('url')
var dcopy = require('deep-copy')
var Headers = require('./headers')
var coreOptions = require('../config/defaults')
  , requestOptions = require('../config/options')


exports.init = function (options) {
  var result = {}

  coreOptions.forEach(function (key) {
    if (key === 'headers') {
      result.headers = new Headers(dcopy(options[key]))
    }
    else if (key === 'agent') {
      if (typeof options.agent === 'object' &&
          !(options.agent instanceof http.Agent)) {
        result.agent = dcopy(options[key])
      }
      else if (options.agent !== undefined) {
        result.agent = options[key]
      }
    }
    else if (key === 'method') {
      if (!options[key]) {
        result[key] = 'GET'
      }
    }
    else if (options[key]) {
      result[key] = options[key]
    }
  })

  requestOptions.forEach(function (key) {
    if (options[key] !== undefined) {
      result[key] = options[key]
    }
  })

  var uri = options.url || options.uri
  if (uri) {
    if (typeof uri === 'string' && uri) {
      uri = url.parse(uri)
    }
    if (typeof uri === 'object') {
      result.protocol = uri.protocol
      result.hostname = uri.hostname
      result.port = uri.port
      result.path = uri.path
    }
    result.uri = uri
  }
  if (result.protocol.indexOf(':') === -1) {
    result.protocol = result.protocol + ':'
  }

  return result
}

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
