
var utils = require('../utils')


exports.request = function (req, options) {
  if (!options.headers.get('content-type')) {
    options.headers.set('content-type', 'application/json')
  }

  options.body = JSON.stringify(options.json).toString('utf8')
}
