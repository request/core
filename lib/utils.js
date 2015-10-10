
var vm = require('vm')
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

  result.protocol = options.url.protocol
  result.hostname = options.url.hostname
  result.port = options.url.port
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

exports.isJSON = function (res) {
  var type = res.headers.get('content-type')
    , encoding = res.headers.get('content-encoding')

  return (/json|javascript/.test(type) || /json/.test(encoding))
}

exports.isJSONP = function (body) {
  return /^\w+[^(]*\(.+\)/.test(body)
}

exports.parseJSONP = function (body) {
  var func = body.replace(/(^\w+[^(]*).*/, '$1')

  var obj = {}
  obj[func] = function (json) {return json}

  var sandbox = vm.createContext(obj)
  var json = vm.runInContext(body, sandbox)

  // either object or string
  return json
}
