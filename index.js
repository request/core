
var util = require('util')
var config = require('./lib/config')
var init = require('./lib/request')
var HTTPDuplex = require('./lib/http-duplex')

util.inherits(Request, HTTPDuplex)


function Request (protocol) {
  HTTPDuplex.call(this, protocol)
}

function request (_options) {
  var options = config.init(_options)
  var req = new Request(options.protocol)

  init(req, options)
  return req
}

module.exports = request
request.Request = Request

if (process.env.CORE_LIB) {
  request._lib = require('./lib')
}
