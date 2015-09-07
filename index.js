
var util = require('util')
var utils = require('./lib/utils')
var HTTPDuplex = require('http-duplex')

util.inherits(Request, HTTPDuplex)


function Request (protocol) {
  HTTPDuplex.call(this, protocol)
}

function request (_options) {
  var options = utils.init(_options)
  var req = new Request(options.protocol)

  if (options.redirect) {
    var redirect = require('redirect')
    redirect(req, options)
  }

  if (options.gzip) {
    var type = typeof options.gzip
      , gzip
    if (type === 'boolean' || type === 'string') {
      gzip = require('gzip')
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
      encoding = require('encoding')
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
    var multipart = require('multipart')
    multipart(req, options)
  }

  if (options.callback) {
    if (typeof options.callback === 'function') {
      var callback = require('callback')
      callback(req, options)
    }
    else {
      throw new Error('calback should be a function')
    }
  }

  req.on('pipe', function (src) {
    req._src = src
  })

  var length = utils.getContentLength(options)
  if (length) {
    options.headers['content-length'] = length
  }
  else {
    options.headers['transfer-encoding'] = 'chunked'
  }

  process.nextTick(function () {
    req.start(utils.filter(options))
    if (options.body) {
      var body = require('body')
      body(req, options)
    }
    // not piped
    if (!req._src && (!options.agent || !options.agent.keepAlive)) {
      req.end()
    }
  })

  return req
}

module.exports = request
request.Request = Request
