
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
  req.start(options)
  return req
}

module.exports = request
request.Request = Request
