
var zlib = require('zlib')


exports.request = function (req, options) {
  options.headers.set('accept-encoding', 'gzip, deflate')
}

exports.response = function (req, res, options) {
  if (req._redirect) return

  var encoding
  if (/gzip|deflate/.test(options.gzip)) {
    encoding = options.gzip
  }
  else {
    encoding = res.headers.get('content-encoding') || 'identity'
  }

  var decompress
  if (/\bdeflate\b/.test(encoding)) {
    decompress = zlib.createInflate()
  }
  else if (/\bgzip\b/.test(encoding)) {
    decompress = zlib.createGunzip()
  }

  if (decompress) {
    req._res = req._res.pipe(decompress)
  }
}
