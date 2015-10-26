
var url = require('url')


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
}
