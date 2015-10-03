
var Qs = require('qs')


function qs (req, options) {
  if (typeof options.qs === 'string') {
    options.qs = Qs.parse(options.qs)
  }

  var url = parsePath(options)
    , base = Qs.parse(url.qs)

  for (var key in options.qs) {
    base[key] = options.qs[key]
  }

  if (Qs.stringify(base) === '') {
    return
  }

  options.path = url.path + '?' + Qs.stringify(base)
}

function parsePath (options) {
  var result = {}

  if (options.path) {
    var arr = options.path.split('?')
    result.path = arr[0]

    if (arr.length === 2) {
      result.qs = arr[1]
    }
  }

  return result
}

module.exports = qs
