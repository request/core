
function request (req, options) {
  if (options.parse.json) {
    if (!options.headers.get('accept')) {
      options.headers.set('accept', 'application/json')
    }
  }
}

parse.isJSON = function (res) {
  var type = res.headers.get('content-type')
    , encoding = res.headers.get('content-encoding')

  return (/json|javascript/.test(type) || /json/.test(encoding))
}

parse.isJSONP = function (body) {
  return /^\w+[^(]*\(.+\)/.test(body)
}

parse.parseJSONP = function (body) {
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

module.exports = parse
