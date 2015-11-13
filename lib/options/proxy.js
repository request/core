
var url = require('url')
var querystring = require('querystring')


exports.request = function (req, options) {
  updateURL(options)
  req.update(options.proxy.url.protocol)
}

exports.response = function (req, res, options) {
  updateURL(options)
  req.update(options.proxy.url.protocol)
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

function updateURL (options) {
  options.proxy = initProxy(options)

  options.url.path =
    options.url.protocol + '//' + options.url.host + options.url.path

  options.headers.set('Host', options.url.hostname)

  if (options.proxy.url.auth && !options.headers.get('proxy-authorization')) {
    setAuthorization(options)
  }
}

function setAuthorization (options) {
  var proxyAuthPieces = options.proxy.url.auth.split(':').map(function (item) {
    return querystring.unescape(item)
  })
  var authHeader = 'Basic ' + toBase64(proxyAuthPieces.join(':'))
  options.headers.set('proxy-authorization', authHeader)
}

function toBase64 (str) {
  return (new Buffer(str || '', 'utf8')).toString('base64')
}
