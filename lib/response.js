
var Headers = require('@http/headers')
var utils = require('./utils')


function response (req, options) {
  return function (res) {
    res.headers = new Headers(res.headers)

    if (options.auth) {
      var auth = require('./options/auth')
      auth(req, options, res)
    }

    if (options.cookie) {
      var cookie = require('./options/cookie')
      cookie(req, options, res)
    }

    if (options.redirect) {
      var redirect = require('./options/redirect')
      redirect(req, options, res)
    }

    if (options.gzip) {
      var gzip = require('./options/gzip')
      gzip(req, options, res)
    }

    if (options.encoding && options.encoding !== 'binary') {
      var encoding = require('./options/encoding')
      encoding(req, options, res)
    }

    // if (options.callback) {
    //   var callback = require('./options/callback')
    //   callback(req, options, res)
    // }
  }
}

module.exports = response
