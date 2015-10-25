
var jsonSafeStringify = require('json-stringify-safe')
var utils = require('../utils')


function safeStringify (obj) {
  try {
    return JSON.stringify(obj)
  }
  catch (e) {
    return jsonSafeStringify(obj)
  }
}

exports.request = function (req, options) {
  if (!options.headers.get('content-type')) {
    options.headers.set('content-type', 'application/json')
  }

  options.body = safeStringify(options.json).toString('utf8')
}
