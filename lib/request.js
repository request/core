
var utils = require('./utils')
var response = require('./response')
var pipe = require('./pipe')
var modules = require('./modules')


function request (req, options) {
  if (process.env.DEBUG) {
    var log = require('@request/log')
    log(req)
  }

  req.on('onresponse', response(req, options))
  req.on('pipe', pipe(req, options))

  if (options.parse === undefined) {
    options.parse = {}
  }
  if (options.stringify === undefined) {
    options.stringify = {}
  }

  if (options.proxy) {
    if (options.tunnel || utils.isTunnelEnabled(options)) {
      var tunnel = modules('tunnel')
      tunnel(req, options)
    }
    else {
      var proxy = modules('proxy')
      proxy(req, options)
    }
  }

  if (options.redirect) {
    var redirect = modules('redirect')
    redirect(req, options)
  }

  if (options.gzip) {
    var gzip = modules('gzip')
    gzip(req, options)
  }

  if (options.multipart) {
    var multipart = modules('multipart')
    multipart(req, options)
  }

  if (options.qs) {
    var qs = modules('qs')
    qs(req, options)
  }
  if (options.form) {
    var form = modules('form')
    form(req, options)
  }
  if (options.json !== undefined) {
    var json = modules('json')
    json(req, options)
  }

  if (options.cookie) {
    var cookie = modules('cookie')
    cookie(req, options)
  }

  if (options.callback) {
    if (typeof options.callback === 'function') {
      var callback = modules('callback')
      callback(req, options)
    }
    else {
      throw new Error('calback should be a function')
    }
  }

  if (options.auth || options.url.auth || options.oauth || options.hawk || options.httpSignature || options.aws) {
    var auth = modules('auth')
    auth(req, options)
  }

  req.once('init', init)
  process.nextTick(init)

  function init () {
    if (req._initialized) return
    if (req._aborted) return

    if (options.length) {
      var length = require('./options/length')
      length(req, options, function (err, length) {
        if (!err && length) {
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
        var parse = modules('parse')
        parse(req, options)
      }
      if (options.body || req._src || !options.end) {
        if (options.headers.get('content-length') === undefined) {
          options.headers.set('transfer-encoding', 'chunked')
        }
      }

      req.emit('options', options)
      req.init(utils.filter(options))

      if (options.timeout !== undefined) {
        var timeout = modules('timeout')
        timeout(req, options)
      }

      if (options.body) {
        var body = modules('body')
        body(req, options)
      }

      if (options.end) {
        var end = modules('end')
        end(req, options)
      }
    }
  }
}

module.exports = request
