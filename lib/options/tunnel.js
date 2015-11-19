'use strict'

var url = require('url')
var tunnel = require('tunnel-agent')

var defaults = {
  // a whitelist of headers to send to a tunneling proxy
  allow: [
    'accept',
    'accept-charset',
    'accept-encoding',
    'accept-language',
    'accept-ranges',
    'cache-control',
    'content-encoding',
    'content-language',
    'content-location',
    'content-md5',
    'content-range',
    'content-type',
    'connection',
    'date',
    'expect',
    'max-forwards',
    'pragma',
    'referer',
    'te',
    'user-agent',
    'via'
  ],
  // a whitelist of headers to send exclusively to a tunneling proxy
  // and not to destination
  exclusive: [
    'proxy-authorization'
  ]
}


function constructProxyHost (options) {
  var result = options.url.hostname + ':'

  if (options.url.port) {
    result += options.url.port
  }
  else if (options.url.protocol === 'https:') {
    result += '443'
  }
  else {
    result += '80'
  }

  return result
}

function constructProxyHeaderWhiteList (headers, proxyHeaderWhiteList) {
  var whiteList = proxyHeaderWhiteList
    .reduce(function (set, header) {
      set[header.toLowerCase()] = true
      return set
    }, {})

  return Object.keys(headers)
    .filter(function (header) {
      return whiteList[header.toLowerCase()]
    })
    .reduce(function (set, header) {
      set[header] = headers[header]
      return set
    }, {})
}

function constructTunnelOptions (options, proxyHeaders) {
  var tunnelOptions = {
    proxy : {
      host      : options.proxy.url.hostname,
      port      : +options.proxy.url.port,
      proxyAuth : options.proxy.url.auth,
      headers   : proxyHeaders
    },
    headers            : options.headers,
    ca                 : options.ca,
    cert               : options.cert,
    key                : options.key,
    passphrase         : options.passphrase,
    pfx                : options.pfx,
    ciphers            : options.ciphers,
    rejectUnauthorized : options.rejectUnauthorized,
    secureOptions      : options.secureOptions,
    secureProtocol     : options.secureProtocol
  }

  return tunnelOptions
}

function getTunnelFn (options) {
  var uriProtocol = (options.url.protocol === 'https:' ? 'https' : 'http')
  var proxyProtocol = (options.proxy.url.protocol === 'https:' ? 'Https' : 'Http')

  var tunnelFnName = [uriProtocol, proxyProtocol].join('Over')
  return tunnel[tunnelFnName]
}

function initHeaders (options) {
  var allow = options.proxy.headers.allow
  var exclusive = options.proxy.headers.exclusive

  if (exclusive) {
    exclusive = exclusive.concat(defaults.exclusive)
  }
  else {
    exclusive = defaults.exclusive
  }

  if (allow) {
    allow = allow.concat(exclusive)
  }
  else {
    allow = defaults.allow.concat(exclusive)
  }

  return {allow: allow, exclusive: exclusive}
}

function initProxy (options) {
  var result = {url: {}, headers: {}}
  if (typeof options.proxy === 'string') {
    result.url = url.parse(options.proxy)
  }
  else if (options.proxy instanceof url.Url) {
    result.url = options.proxy
  }
  else {
    result = options.proxy
  }
  if (typeof result.url === 'string') {
    result.url = url.parse(result.url)
  }
  return result
}

function setup (options) {
  options.proxy = initProxy(options)

  var headers = initHeaders(options)

  var proxyHeaders = constructProxyHeaderWhiteList(options.headers, headers.allow)
  proxyHeaders.host = constructProxyHost(options)

  headers.exclusive.forEach(function (header) {
    options.headers.remove(header)
  })

  var tunnelFn = getTunnelFn(options)
  var tunnelOptions = constructTunnelOptions(options, proxyHeaders)
  options.agent = tunnelFn(tunnelOptions)
  options.agent._tunnel = true

  options.headers.set('host', options.url.hostname)
}

exports.request = function (req, options) {
  setup(options)
}

exports.response = function (req, res, options) {
  setup(options)
}
