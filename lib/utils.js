
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
