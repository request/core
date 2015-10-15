
var utils = require('./utils')
var response = require('./response')
var modules = require('./modules')


function request (req, options) {
  if (process.env.DEBUG) {
    var log = require('@http/log')
    log(req)
  }

  req.on('response', response(req, options))

  if (options.redirect) {
    var redirect = modules('redirect')
    redirect(req, options)
  }

  if (options.gzip) {
    var gzip = modules('gzip')
    gzip(req, options)
  }

  if (options.multipart) {
    var multipart = require('./options/multipart')
    multipart(req, options)
  }

  if (options.qs) {
    var qs = require('./options/qs')
    qs(req, options)
  }
  if (options.form) {
    var form = require('./options/form')
    form(req, options)
  }
  if (options.json) {
    var json = require('./options/json')
    json(req, options)
  }

  if (options.cookie) {
    var cookie = modules('cookie')
    cookie(req, options)
  }

  if (options.callback) {
    if (typeof options.callback === 'function') {
      var callback = require('./options/callback')
      callback(req, options)
    }
    else {
      throw new Error('calback should be a function')
    }
  }

  req.once('init', init)
  process.nextTick(init)

  function init () {
    if (req._initialized) return

    if (options.length) {
      var length = require('./options/length')
      length(req, options, function (length) {
        if (length) {
          options.headers.set('content-length', length)
        }
        _init()
      })
    }
    else {
      _init()
    }

    function _init () {
      if (options.parse) {
        var parse = require('./options/parse')
        parse(req, options)
      }
      if (options.body || req._src || !options.end) {
        if (options.headers.get('content-length') === undefined) {
          options.headers.set('transfer-encoding', 'chunked')
        }
      }

      if (options.auth || options.oauth || options.hawk || options.httpSignature || options.aws) {
        var auth = modules('auth')
        auth(req, options)
      }

      req.emit('options', options)
      req.init(utils.filter(options))

      if (options.body) {
        var body = require('./options/body')
        body(req, options)
      }

      if (options.end) {
        var end = require('./options/end')
        end(req, options)
      }
    }
  }
}

module.exports = request
