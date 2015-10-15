
var vm = require('vm')


exports.request = function (req, options) {
  if (options.parse.json) {
    if (!options.headers.get('accept')) {
      options.headers.set('accept', 'application/json')
    }
  }
}

exports.isJSON = function (res) {
  var type = res.headers.get('content-type')
    , encoding = res.headers.get('content-encoding')

  return (/json|javascript/.test(type) || /json/.test(encoding))
}

exports.isJSONP = function (body) {
  return /^\w+[^(]*\(.+\)/.test(body)
}

exports.parseJSONP = function (body) {
  var func = body.replace(/(^\w+[^(]*).*/, '$1')

  var obj = {}
  obj[func] = function (json) {return json}

  var sandbox = vm.createContext(obj)
  var json = vm.runInContext(body, sandbox)

  // either object or string
  return json
}

function parse (a, b, c) {
  if (arguments.length === 2) {
    request(a, b)
  }
  else {
    response(a, b, c)
  }
}
