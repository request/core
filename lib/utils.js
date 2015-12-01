
var Headers = require('@request/headers')
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

  if (options.proxy && !this.isTunnelEnabled(options)) {
    result.protocol = options.proxy.url.protocol
    result.hostname = options.proxy.url.hostname
    result.port = options.proxy.url.port

    if (options.agent && options.agent._tunnel) {
      delete options.agent
    }
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

exports.isTunnelEnabled = function (options) {
  // Tunnel HTTPS by default. Allow the user to override this setting.

  // If options.tunnel is set (the user specified a value), use it.
  if (options.tunnel !== undefined) {
    return options.tunnel
  }

  // If the destination is HTTPS, tunnel.
  if (options.url.protocol === 'https:') {
    return true
  }

  // Otherwise, do not use tunnel.
  return false
}

exports.enableUnixSocket = function (options) {
  var parts = options.url.path.split(':')
    , host = parts[0]
    , path = parts[1]

  options.socketPath = host

  options.url.host = host
  options.url.hostname = host
  options.url.pathname = path
  options.url.path = path
  // options.url.isUnix = true
}
