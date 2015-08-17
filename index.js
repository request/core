
var util = require('util')
  , url = require('url')
var HTTPDuplex = require('http-duplex')

util.inherits(Request, HTTPDuplex)


function Request (options) {
  this.url = options.url || options.uri
  if (typeof this.uri === 'string') {
    this.url = url.parse(this.url)
  }
  var protocol
  if (!this.url) {
    protocol = options.protocol
    delete options.protocol
  }
  else {
    protocol = this.url.protocol
  }
  HTTPDuplex.call(this, protocol)
}

function request (options) {
  var req = new Request(options)

  // buffer
  if (options.callback) {
    if (typeof options.callback === 'function') {
      var buffer
      try {
        buffer = require('buffer-response')
      } catch (err) {
        throw new Error('npm install buffer-response')
      }
      buffer(req, options.encoding, options.callback)
    } else {
      throw new Error('calback should be a function')
    }
  }
  // stream
  else {
    Object.keys(options).forEach(function (name) {
      if (/gzip|encoding/.test(name)) {
        var module = {}
          , type = typeof options[name]
        if (type === 'boolean' || type === 'string') {
          try {
            module[name] = require(name + '-stream')
          } catch (err) {
            throw new Error('npm install ' + name + '-stream')
          }
        }
        else if (type === 'function') {
          module[name] = options.gzip()
        }
        else {
          throw new Error(name + ' should be boolean, string or a function')
        }
        var value
        if (type === 'string') {
          value = options[name]
        }
        module[name](req, value)
        delete options[name]
      }
    })
  }

  var piped = false
  req.on('pipe', function (src) {
    piped = true
  })

  process.nextTick(function () {
    if (!piped) {
      req.end()
    }
  })

  req.start(options)
  return req
}

module.exports = request
request.Request = Request
