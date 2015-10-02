
var http = require('http')
  , url = require('url')
var dcopy = require('deep-copy')
var Headers = require('@http/headers')
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
      else {
        result[key] = options[key]
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

  _url(options, result)

  return result
}

function _url (options, result) {
  var uri = options.url || options.uri

  if (typeof uri === 'string') {
    uri = url.parse(uri)
  }
  else {
    var pathname, query
    if (options.pathname) {
      var arr = options.pathname.split('?')
      pathname = arr[0]
      if (arr.length === 2) {
        query = arr[1]
      }
    }
    var str = url.format({
      protocol: options.protocol,
      hostname: options.hostname || options.host,
      port: options.port,
      pathname: pathname,
      query: query
    })
    uri = url.parse(str)
  }
  result.uri = uri

  result.protocol = uri.protocol
  result.hostname = uri.hostname
  result.port = uri.port
  result.path = uri.path

  if (result.protocol.indexOf(':') === -1) {
    result.protocol = result.protocol + ':'
  }
}
