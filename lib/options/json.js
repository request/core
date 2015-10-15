
var utils = require('../utils')


exports.request = function (req, options) {
  if (!options.headers.get('content-type')) {
    options.headers.set('content-type', 'application/json')
  }

  var body
  if (typeof options.json === 'object') {
    body = JSON.stringify(options.json).toString('utf8')
  }
  else if (typeof options.json === 'string') {
    body = options.json.toString('utf8')
  }

  options.body = body
}
