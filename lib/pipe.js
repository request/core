
function pipe (req, options) {
  return function (src) {
    // if (req.ntick && req._started) {
    //   req.emit('error', new Error('You cannot pipe to this stream after the outbound request has started.'))
    // }

    req._src = src

    // file stream
    if (src.hasOwnProperty('fd')) {
      // if (!options.headers.get('content-type')) {
      //   options.headers.set('content-type', mime.lookup(src.path))
      // }
    }
    else {
      // if (src.headers) {
      //   for (var key in src.headers) {
      //     if (!self.hasHeader(key)) {
      //       self.setHeader(key, src.headers[key])
      //     }
      //   }
      // }
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
