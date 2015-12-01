
var Headers = require('@request/headers')
var utils = require('./utils')
  , modules = require('./modules')


function response (req, options) {
  return function (res) {
    res.headers = new Headers(res.headers)

    if (options.timeout) {
      var timeout = modules('timeout')
      timeout(req, res, options)
    }

    if (options.auth || options.oauth) {
      var auth = modules('auth')
      auth(req, res, options)
    }

    if (options.cookie) {
      var cookie = modules('cookie')
      cookie(req, res, options)
    }

    if (options.redirect) {
      var redirect = modules('redirect')
      redirect(req, res, options)
    }

    if (options.gzip) {
      var gzip = modules('gzip')
      gzip(req, res, options)
    }

    if (options.encoding && options.encoding !== 'binary') {
      var encoding = modules('encoding')
      encoding(req, res, options)
    }

    // if (options.callback) {
    //   var callback = require('./options/callback')
    //   callback(req, options, res)
    // }

    if (!req._redirect) {
      req._dests.forEach(function (dest) {
        req.pipeDest(dest, res)
      })
      req.emit('response', res)
    }
  }
}

module.exports = response
