
var iconv = require('iconv-lite')


exports.response = function (req, res, options) {
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

  req._res = (req._res || res).pipe(iconv.decodeStream(encoding))
}
