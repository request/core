
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
        result.explicitMethod = false
      }
      else {
        result[key] = options[key]
      }
    }
    else if (options[key] !== undefined) {
      result[key] = options[key]
    }
  })

  requestOptions.forEach(function (key) {
    if (options[key] !== undefined) {
      result[key] = options[key]
    }
  })

  result.url = parseURL(options)

  if (!result.protocol) {
    result.protocol = result.url.protocol
  }

  return result
}

function parseURL (options) {
  var url = options.url || options.uri

  if (typeof url === 'string') {
    return _url.parse(url)
  }
  else if (url instanceof _url.Url) {
    return url
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
    return _url.parse(str)
  }
}
