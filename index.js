
var util = require('util')
  , url = require('url')
var HTTPDuplex = require('http-duplex')

util.inherits(Request, HTTPDuplex)


function Request (options) {
  this._url = options.url || options.uri
  if (typeof this._url === 'string') {
    this._url = url.parse(this._url)
  }
  var protocol
  if (!this._url) {
    protocol = options.protocol
    delete options.protocol
  }
  else {
    protocol = this._url.protocol
  }
  HTTPDuplex.call(this, protocol)
}

function request (options) {
  options.headers = options.headers || {}
  var req = new Request(options)

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
      throw new Error(name + ' should be boolean, string or a function')
    }
    var value
    if (type === 'string') {
      value = options.gzip
    }
    gzip(req, value)
    delete options.gzip
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
      throw new Error(name + ' should be boolean, string or a function')
    }
    var value
    if (type === 'string') {
      value = options.encoding
    }
    encoding(req, value)
    delete options.encoding
  }

  if (options.callback) {
    if (typeof options.callback === 'function') {
      var buffer = require('buffer-response')
      buffer(req, options.encoding, options.callback)
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
    req.start(options)
    // not piped
    if (!req._src) {
      req.end()
    }
  })

  return req
}

module.exports = request
request.Request = Request
