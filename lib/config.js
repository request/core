
var http = require('http')
var _url = require('url')
var dcopy = require('deep-copy')
var Headers = require('@request/headers')
var utils = require('./utils')
var coreOptions = require('../config/defaults')
var requestOptions = require('../config/options')


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
  if (result.url.host === 'unix') {
    utils.enableUnixSocket(result)
  }

  if (!result.protocol) {
    result.protocol = result.url.protocol
  }

  return result
}

function formatURL (obj) {
  var pathname, query
  if (obj.pathname) {
    var arr = obj.pathname.split('?')
    pathname = arr[0]
    if (arr.length === 2) {
      query = arr[1]
    }
  }
  return _url.format({
    protocol: obj.protocol,
    hostname: obj.hostname || obj.host,
    port: obj.port,
    pathname: pathname,
    query: query
  })
}

function parseURL (options) {
  var url = options.url || options.uri

  if (typeof url === 'string') {
    return _url.parse(url)
  }
  else if (typeof url === 'object') {
    var str = formatURL(url)
    return _url.parse(str)
  }
  else {
    var str = formatURL(options)
    return _url.parse(str)
  }
}
