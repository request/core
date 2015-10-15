
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

  if (/^https/.test(protocol)) {
    self._client = https
  }
  else if (/^http/.test(protocol)) {
    self._client = http
  }

  self.once('pipe', function (src) {
    self._src = src
  })
}

HTTPDuplex.prototype.init = function (options) {
  var self = this

  self._req = self._client.request(options)
  self.emit('request', self._req, options)

  self._req.on('response', function (res) {

    self._res = res
    self.emit('response', res)

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

  if (!self._initialized) {
    self._started = true
    self.emit('init')
  }

  if (self._redirect && !self._redirected) {
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

  if (!self._initialized) {
    self._started = true
    self.emit('init')
  }

  if (self._redirect && !self._redirected) {
    if (chunk) {
      self._chunks.push(chunk)
    }
    if (self._src) {
      self._src.pause()
    }
  }

  if (self._writableState.bufferedRequest) {
    // never called
    self._req.once('drain', function () {
      self._req.end(chunk, encoding, cb)
    })
  }
  else {
    return self._req.end(chunk, encoding, cb)
  }
}

// HTTP Methods

HTTPDuplex.prototype.abort = function () {
  // this._aborted = true

  if (this._req) {
    this._req.abort()
  }
  // this may throw an error
  // in case_res is modified in gzip and/or encoding
  else if (this._res) {
    this._res.abort()
  }

  this.emit('abort')
}
