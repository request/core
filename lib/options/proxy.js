
var url = require('url')
var querystring = require('querystring')


exports.request = function (req, options) {
  updateURL(options)
}

exports.response = function (req, res, options) {
  updateURL(options)
}

function updateURL (options) {
  if (typeof options.proxy === 'string') {
    options.proxy = url.parse(options.proxy)
  }

  var absolute =
    options.proxy.protocol + '//' + options.url.host + options.url.path

  options.url.path = absolute

  options.headers.set('Host', options.url.hostname)

  options.url.hostname = options.proxy.hostname
  options.url.port = options.proxy.port


  if (options.proxy.auth && !options.headers.get('proxy-authorization')) {
    setAuthorization(options)
  }
}

function setAuthorization (options) {
  var proxyAuthPieces = options.proxy.auth.split(':').map(function (item) {
    return querystring.unescape(item)
  })
  var authHeader = 'Basic ' + toBase64(proxyAuthPieces.join(':'))
  options.headers.set('proxy-authorization', authHeader)
}

function toBase64 (str) {
  return (new Buffer(str || '', 'utf8')).toString('base64')
}
