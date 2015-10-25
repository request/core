
exports.request = function (req, options) {
  options.timeout = options.timeout < 0 ? 0 : options.timeout
  // Set a timeout in memory - this block will throw if the server takes more
  // than `timeout` to write the HTTP status and headers (corresponding to
  // the on('response') event on the client). NB: this measures wall-clock
  // time, not the time between bytes sent by the server.
  req._timeout = setTimeout(function () {
    var err = new Error('ETIMEDOUT')
    err.code = 'ETIMEDOUT'
    err.connect = (req._req.socket && req._req.socket.readable === false)
    req.abort()
    req.emit('error', err)
  }, options.timeout)

  // Set an additional timeout on the socket, via the `setsockopt` syscall.
  // This timeout sets the amount of time to wait *between* bytes sent
  // from the server, and may or may not correspond to the wall-clock time
  // elapsed from the start of the request.
  //
  // In particular, it's useful for erroring if the server fails to send
  // data halfway through streaming a response.
  req._req.setTimeout(options.timeout, function () {
    var err = new Error('ESOCKETTIMEDOUT')
    err.code = 'ESOCKETTIMEDOUT'
    err.connect = false
    req.abort()
    req.emit('error', err)
  })
}

exports.response = function (req, res, options) {
  clearTimeout(req._timeout)
  req._timeout = null
}
