
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

  if (options.proxy && !this.isTunnelEnabled(options)) {
    result.protocol = options.proxy.protocol
    result.hostname = options.proxy.hostname
    result.port = options.proxy.port
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
  // Tunnel HTTPS by default, or if a previous request in the redirect chain
  // was tunneled.  Allow the user to override this setting.

  // If self.tunnel is already set (because this is a redirect), use the
  // existing value.
  if (options.agent && options.agent._tunnel) {
    return options.agent
  }

  // If options.tunnel is set (the user specified a value), use it.
  if (options.tunnel !== undefined) {
    return options.tunnel
  }

  // If the destination is HTTPS, tunnel.
  if (options.url.protocol === 'https:') {
    return true
  }

  // Otherwise, leave tunnel unset, because if a later request in the redirect
  // chain is HTTPS then that request (and any subsequent ones) should be
  // tunneled.
  return undefined
}
