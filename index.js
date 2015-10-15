
var util = require('util')
var config = require('./lib/config')
var _request = require('./lib/request')
var HTTPDuplex = require('./lib/http-duplex')

util.inherits(Request, HTTPDuplex)


function Request (protocol) {
  HTTPDuplex.call(this, protocol)
}

function request (_options, init) {
  var options = config.init(_options)
  var req = new Request(options.protocol)

  if (init === undefined) {
    _request(req, options)
  }

  return req
}

module.exports = request
request.Request = Request
request.init = _request
