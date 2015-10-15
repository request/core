
var isstream = require('isstream')


exports.request = function (req, options) {
  if (isstream(options.body)) {
    options.body.pipe(req)
  }
  else if (typeof options.body === 'string') {
    req.write(options.body)
  }
  else if (Buffer.isBuffer(options.body)) {
    req.write(options.body)
  }
  else if (Array.isArray(options.body)) {
    options.body.forEach(function (item) {
      // req.write(item)
      req._req.write(item)
    })
  }
}
