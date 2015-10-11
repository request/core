
var iconv = require('iconv-lite')


function response (req, res, options) {
  if (req._redirect) return

  var type = res.headers.get('content-type')

  var encoding
  if (typeof options.encoding === 'string') {
    encoding = options.encoding
  }
  else if (/charset=[^;]+/.test(type)) {
    encoding = type.replace(/.*charset=([^;]+).*/, '$1')
  }
  else {
    encoding = 'utf8'
  }

  req._res = req._res.pipe(iconv.decodeStream(encoding))
}

module.exports = function (a, b, c) {
  if (arguments.length === 2) {
    request(a, b)
  }
  else {
    response(a, b, c)
  }
}
