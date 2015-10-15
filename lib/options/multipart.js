'use strict'

var _multipart = require('@http/multipart')


exports.request = function (req, options) {
  var result = _multipart({
    multipart: options.multipart,
    contentType: options.headers.get('content-type')
  })

  options.headers.set('content-type', result.contentType)

  options.body = result.body
}
