
var util = require('util')
var utils = require('./lib/utils')
var HTTPDuplex = require('http-duplex')

util.inherits(Request, HTTPDuplex)


function Request (protocol) {
  HTTPDuplex.call(this, protocol)
}

function request (options) {
  options = utils.init(options)
  var req = new Request(options.protocol)

  if (options.redirect) {
    var redirect = require('redirect')
    redirect(req, options)
  }

  if (options.gzip) {
    var type = typeof options.gzip
      , gzip
    if (type === 'boolean' || type === 'string') {
      gzip = require('gzip-stream')
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
      encoding = require('encoding-stream')
    }
    else if (type === 'function') {
      encoding = options.encoding
    }
    else {
      throw new Error('encoding should be boolean, string or a function')
    }
    encoding(req, options)
  }

  if (options.callback) {
    if (typeof options.callback === 'function') {
      var buffer = require('buffer-response')
      buffer(req, options)
    } else {
      throw new Error('calback should be a function')
    }
  }

  req.on('pipe', function (src) {
    req._src = src
    options.headers['transfer-encoding'] = 'chunked'
  })

  if (options.body) {
    var body = require('body')
    body(req, options)
  }

  process.nextTick(function () {
    req.start(utils.filter(options))
    // not piped
    if (!req._src) {
      req.end()
    }
  })

  return req
}

module.exports = request
request.Request = Request
