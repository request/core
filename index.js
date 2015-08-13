
module.exports = Request

var util = require('util')
  , url = require('url')
var HTTPDuplex = require('http-duplex')

util.inherits(Request, HTTPDuplex)


function Request (options) {
  var v = url.parse(options.url)

  HTTPDuplex.call(this, v.protocol)
}
