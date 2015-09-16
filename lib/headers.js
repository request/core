
function Headers (headers) {
  for (var key in headers) {
    this[key] = headers[key]
  }
}

Headers.prototype.get = function (header) {
  return this._value(header)
}

Headers.prototype.set = function (header, value) {
  var name = this._name(header)
  if (name) {
    this[name] = value
  }
  else {
    this[header] = value
  }
}

Headers.prototype.remove = function (header) {
  var name = this._name(header)
  if (name) {
    delete this[name]
  }
}

Headers.prototype.toObject = function () {
  var headers = {}
  for (var key in this) {
    if (typeof this[key] !== 'function') {
      headers[key] = this[key]
    }
  }
  return headers
}

Headers.prototype._name = function (header) {
  for (var name in this) {
    if (name.toLowerCase() === header.toLowerCase()) {
      return name
    }
  }
}

Headers.prototype._value = function (header) {
  for (var name in this) {
    if (name.toLowerCase() === header.toLowerCase()) {
      return this[name]
    }
  }
}

module.exports = Headers
