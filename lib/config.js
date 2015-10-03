
var http = require('http')
  , _url = require('url')
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

  parseURL(options, result)

  return result
}

function parseURL (options, result) {
  var url = options.url || options.uri

  if (typeof url === 'string') {
    url = _url.parse(url)
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
    var str = _url.format({
      protocol: options.protocol,
      hostname: options.hostname || options.host,
      port: options.port,
      pathname: pathname,
      query: query
    })
    url = _url.parse(str)
  }
  result.url = url

  result.protocol = url.protocol
  result.hostname = url.hostname
  result.port = url.port
  result.path = url.path

  if (result.protocol.indexOf(':') === -1) {
    result.protocol = result.protocol + ':'
  }
}
