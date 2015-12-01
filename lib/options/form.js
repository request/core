
var qs = require('@request/qs')


exports.request = function (req, options) {
  var header = options.headers.get('content-type')

  if (!/^application\/x-www-form-urlencoded\b/.test(header)) {
    options.headers.set('content-type', 'application/x-www-form-urlencoded')
  }

  if (typeof options.form === 'object') {
    options.body = qs.stringify(options.form, options).toString('utf8')
  }
  else if (typeof options.form === 'string') {
    // qs makes rfc3986 encoding internally
    // so the string needs to be stringified again
    var params = options.form.toString('utf8')
    options.body = qs.stringify(qs.parse(params, options), options)
  }
}
