'use strict'

var _multipart = require('@request/multipart')


exports.request = function (req, options) {
  var result = _multipart({
    multipart: options.multipart,
    contentType: options.headers.get('content-type'),
    preambleCRLF: options.preambleCRLF,
    postambleCRLF: options.postambleCRLF
  })

  options.headers.set('content-type', result.contentType)

  options.body = result.body
}
