
function Headers (headers) {
  this.headers = {}
  for (var key in headers) {
    this.headers[key.toLowerCase()] = headers[key]
  }
}

Headers.prototype.get = function (header) {
  return this.headers[header.toLowerCase()]
}

Headers.prototype.set = function (header, value) {
  return this.headers[header.toLowerCase()] = value
}

module.exports = Headers
