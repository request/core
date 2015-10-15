
var url = require('url')
var _qs = require('qs')


exports.request = function (req, options) {
  if (typeof options.qs === 'string') {
    options.qs = _qs.parse(options.qs)
  }

  var base = _qs.parse(options.url.query)
  for (var key in options.qs) {
    base[key] = options.qs[key]
  }

  if (_qs.stringify(base) === '') return

  options.url = url.parse(
    options.url.href.split('?')[0] + '?' + _qs.stringify(base)
  )
}
