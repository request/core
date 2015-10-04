
var util = require('util')
var config = require('./lib/config')
  , utils = require('./lib/utils')
var HTTPDuplex = require('./lib/http-duplex')

util.inherits(Request, HTTPDuplex)


function Request (protocol) {
  HTTPDuplex.call(this, protocol)
}

function request (_options) {
  var options = config.init(_options)
  var req = new Request(options.protocol)
  req.on('response', function (res) {
    utils.response(res)
  })

  if (process.env.DEBUG) {
    var log = require('./lib/log')
    log(req)
  }

  if (options.redirect) {
    if (typeof options.redirect !== 'object') {
      options.redirect = {}
    }
    var redirect = require('./lib/options/redirect')
    redirect(req, options)
  }

  if (options.gzip) {
    var type = typeof options.gzip
      , gzip
    if (type === 'boolean' || type === 'string') {
      gzip = require('./lib/options/gzip')
    }
    else if (type === 'function') {
      gzip = options.gzip
    }
    else {
      throw new Error('gzip should be boolean, string or a function')
    }
    gzip(req, options)
  }
  if (options.encoding && options.encoding !== 'binary') {
    var type = typeof options.encoding
      , encoding
    if (type === 'boolean' || type === 'string') {
      encoding = require('./lib/options/encoding')
    }
    else if (type === 'function') {
      encoding = options.encoding
    }
    else {
      throw new Error('encoding should be boolean, string or a function')
    }
    encoding(req, options)
  }

  if (options.multipart) {
    var multipart = require('./lib/options/multipart')
    multipart(req, options)
  }

  if (options.callback) {
    if (typeof options.callback === 'function') {
      var callback = require('./lib/options/callback')
      callback(req, options)
    }
    else {
      throw new Error('calback should be a function')
    }
  }
  if (!options.parse) {
    options.parse = {}
  }

  if (options.qs) {
    var qs = require('./lib/options/qs')
    qs(req, options)
  }
  if (options.form) {
    var form = require('./lib/options/form')
    form(req, options)
  }
  if (options.json) {
    var json = require('./lib/options/json')
    json(req, options)
  }

  req.once('init', init)
  process.nextTick(init)

  function init () {
    if (req._initialized) return

    if (options.length) {
      var length = require('./lib/options/length')
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
      if (options.parse.json) {
        if (!options.headers.get('accept')) {
          options.headers.set('accept', 'application/json')
        }
      }
      if (options.body || req._src || !options.end) {
        if (options.headers.get('content-length') === undefined) {
          options.headers.set('transfer-encoding', 'chunked')
        }
      }

      if (options.auth || options.oauth || options.hawk || options.httpSignature || options.aws) {
        var auth = require('./lib/options/auth')
        auth(req, options)
      }

      req.emit('options', options)
      req.init(utils.filter(options))

      if (options.body) {
        var body = require('./lib/options/body')
        body(req, options)
      }

      if (options.end) {
        var end = require('./lib/options/end')
        end(req, options)
      }
    }
  }

  return req
}

module.exports = request
request.Request = Request
