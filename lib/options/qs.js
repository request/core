
var url = require('url')
var _qs = require('@request/qs')
var utils = require('../utils')


exports.request = function (req, options) {
  if (typeof options.qs === 'string') {
    options.qs = _qs.parse(options.qs, options)
  }

  var base = _qs.parse(options.url.query, options)
  for (var key in options.qs) {
    base[key] = options.qs[key]
  }

  if (_qs.stringify(base) !== '') {
    options.url = url.parse(
      options.url.href.split('?')[0] + '?' + _qs.stringify(base, options)
    )
  }

  if (options.url.host === 'unix') {
    utils.enableUnixSocket(options)
  }
}
