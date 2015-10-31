
var mime = require('mime-types')


function pipe (req, options) {
  return function (src) {
    // if (req.ntick && req._started) {
    //   req.emit('error', new Error('You cannot pipe to this stream after the outbound request has started.'))
    // }

    req._src = src

    // file stream
    if (src.hasOwnProperty('fd')) {
      if (!options.headers.get('content-type')) {
        options.headers.set('content-type', mime.lookup(src.path))
      }
    }
    else {
      if (src.headers) {
        for (var key in src.headers) {
          if (!options.headers.get(key)) {
            options.headers.set(key, src.headers[key])
          }
        }
      }
      if (options.parse.json && !options.headers.get('content-type')) {
        options.headers.set('content-type', 'application/json')
      }
      // if (self._json && !self.hasHeader('content-type')) {
      //   self.setHeader('content-type', 'application/json')
      // }
      if (src.method && !options.explicitMethod) {
        options.method = src.method
      }
    }
  }
}

module.exports = pipe
