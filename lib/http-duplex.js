
module.exports = HTTPDuplex

var util = require('util')
  , http = require('http')
  , https = require('https')
  , stream = require('stream')

util.inherits(HTTPDuplex, stream.Duplex)


function HTTPDuplex (protocol) {
  stream.Duplex.call(this)

  var self = this
  self._chunks = []
  self._dests = []

  self.update(protocol)
}

HTTPDuplex.prototype.update = function (protocol) {
  var self = this

  if (/^https/.test(protocol)) {
    self._client = https
  }
  else if (/^http/.test(protocol)) {
    self._client = http
  }
}

HTTPDuplex.prototype.forwardEvents = function (req) {
  var self = this
  req.on('socket', self.emit.bind(self, 'socket'))
  req.on('error', function (err) {
    if (self._aborted) {
      return
    }
    clearTimeout(req._timeout)
    req._timeout = null
    self.emit('error', err)
  })
}

HTTPDuplex.prototype.init = function (options) {
  var self = this

  self._req = self._client.request(options)
  self.forwardEvents(self._req)
  self.emit('request', self._req, options)

  self._req.on('response', function (res) {
    delete self._res
    self.emit('onresponse', res)
    if (!self._res) {
      self._res = res
    }

    self._res.on('data', function (chunk) {
      if (self._redirect) return
      if (!self.push(chunk)) {
        self._res.pause()
      }
    })

    self._res.on('end', function () {
      if (self._redirect) return
      self.push(null)
    })
  })

  self._initialized = true
}

HTTPDuplex.prototype._read = function (n) {
  if (this._res) {
    this._res.resume()
  }
}

HTTPDuplex.prototype._write = function (chunk, encoding, cb) {
  var self = this

  if (self._aborted) {
    return
  }

  if (!self._initialized) {
    self._started = true
    self.emit('init')
  }

  if (self._redirect && self._auth && !self._redirected) {
    self._chunks.push(chunk)
    if (self._src) {
      self._src.pause()
    }
  }

  return self._req.write(chunk, encoding, cb)
}

HTTPDuplex.prototype._writev = function (chunks, cb) {
  var self = this

  chunks.forEach(function (obj) {
    self._req.write(obj.chunk, obj.encoding)
  })

  cb()
}

HTTPDuplex.prototype.end = function (chunk, encoding, cb) {
  var self = this
  self._ended = true

  if (self._aborted) {
    return
  }

  if (!self._initialized) {
    self._started = true
    self.emit('init')
  }

  if (self._redirect && self._auth && !self._redirected) {
    if (chunk) {
      self._chunks.push(chunk)
    }
    if (self._src) {
      self._src.pause()
    }
  }

  if (self._writableState.bufferedRequest) {
    // self._req.once('drain', function () {
    //   self._req.end(chunk, encoding, cb)
    // })
  }
  else {
    return self._req.end(chunk, encoding, cb)
  }
}

// HTTP Methods

HTTPDuplex.prototype.abort = function () {
  this._aborted = true

  if (this._req) {
    this._req.abort()
  }
  // this may throw an error
  // in case _res is modified in gzip and/or encoding
  else if (this._res) {
    this._res.abort()
  }

  this.emit('abort')
}

// Pipe

HTTPDuplex.prototype.pipeDest = function (dest, res) {
  var self = this

  // TODO: implement tests for these cases

  // Called after the response is received
  if (dest.headers && !dest.headersSent) {
    // if (res.headers.get('content-type')) {
    //   var ctname = res.headers.get('content-type')
    //   if (dest.setHeader) {
    //     // dest.setHeader(ctname, res.headers[ctname])
    //     dest.headers.set(ctname, res.headers[ctname])
    //   }
    //   else {
    //     dest.headers[ctname] = res.headers[ctname]
    //   }
    // }

    // if (res.caseless.has('content-length')) {
    //   var clname = res.caseless.has('content-length')
    //   if (dest.setHeader) {
    //     dest.setHeader(clname, res.headers[clname])
    //   } else {
    //     dest.headers[clname] = res.headers[clname]
    //   }
    // }
  }
  if (dest.setHeader && !dest.headersSent) {
    for (var key in res.headers.toObject()) {
      // If the response content is being decoded, the Content-Encoding header
      // of the response doesn't represent the piped content, so don't pass it.
      if (!self.gzip || key !== 'content-encoding') {
        dest.setHeader(key, res.headers[key])
      }
    }
    dest.statusCode = res.statusCode
  }
  if (self.pipefilter) {
    self.pipefilter(res, dest)
  }
}

HTTPDuplex.prototype.pipe = function (dest, opts) {
  var self = this

  // if (self.response) {
  //   if (self._destdata) {
  //     self.emit('error', new Error('You cannot pipe after data has been emitted from the response.'))
  //   } else if (self._ended) {
  //     self.emit('error', new Error('You cannot pipe after the response has been ended.'))
  //   } else {
  //     stream.Stream.prototype.pipe.call(self, dest, opts)
  //     self.pipeDest(dest)
  //     return dest
  //   }
  // } else {
    self._dests.push(dest)
    stream.Stream.prototype.pipe.call(self, dest, opts)
    return dest
  // }
}
