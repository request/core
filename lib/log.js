
var url = require('url')
var debug = require('debug')
  , chalk = require('chalk')
  , prettyjson = require('prettyjson')
  , extend = require('extend')

var is = {
  req: debug('req'),
  res: debug('res'),
  http: debug('http'),
  raw: debug('raw'),
  body: debug('body'),
  json: debug('json')
}

var options = {
  keysColor: 'blue',
  stringColor: 'grey'
}


function log (req) {
  req.on('options', function (_options) {
    if (is.raw.name === 'enabled') {
      console.log(chalk.gray.inverse('options'))
      console.log(prettyjson.render(_options, options, 4))
    }
  })

  req.on('request', function (req, _options) {
    if (is.http.name === 'enabled') {
      console.log(chalk.gray.inverse('options'))
      console.log(prettyjson.render(_options, options, 4))
    }

    if (is.req.name === 'enabled') {
      var mt = method(req.method)
      console.log(
        chalk.cyan.inverse('req'),
        mt(req.method),
        chalk.yellow(uri(req))
      )

      var headers = {}
      for (var key in req._headerNames) {
        var name = req._headerNames[key]
        headers[name] = req._headers[key]
      }
      console.log(prettyjson.render(headers, options, 4))
    }

    if (is.body.name === 'enabled') {
      if (_options.body) {
        console.log(chalk.gray.inverse('body'), _options.body)
      }
    }
  })

  req.on('response', function (res) {
    var code = res.statusCode

    var st = status(res.statusCode)
    if (is.res.name === 'enabled') {
      console.log(
        chalk.yellow.inverse('res'),
        st(res.statusCode + ' ' + res.statusMessage))
      console.log(prettyjson.render(res.headers, options, 4))
    }
  })

  req.on('callback', function (body) {
    if (is.body.name === 'enabled') {
      console.log(chalk.gray.inverse('body'), body)
    }
  })

  req.on('json', function (body) {
    if (is.json.name === 'enabled') {
      console.log(chalk.gray.inverse('json'), body)
    }
  })
}

function method (verb) {
  if (/GET/.test(verb)) {
    return chalk.green
  }
  else if (/POST/.test(verb)) {
    return chalk.cyan
  }
  else if (/PUT/.test(verb)) {
    return chalk.cyan
  }
  else if (/DELETE/.test(verb)) {
    return chalk.red
  }
  else if (/HEAD|OPTIONS|CONNECT/.test(verb)) {
    return chalk.yellow
  }
  else if (/TRACE/.test(verb)) {
    return chalk.gray
  }
}

function uri (req) {
  return req.agent.protocol + '//' + req._headers.host +
    (req.path === '/' ? '' : req.path)

  // return url.format({
  //   protocol: req.agent.protocol,
  //   host: req._headers.host,
  //   pathname: (req.path === '/' ? '' : req.path)
  // })
}

function status (code) {
  if (code >= 100 && code <= 199) {
    return chalk.white
  }
  else if (code >= 200 && code <= 299) {
    return chalk.green
  }
  else if (code >= 300 && code <= 399) {
    return chalk.yellow
  }
  else if (code >= 400 && code <= 499) {
    return chalk.red
  }
  else if (code >= 500 && code <= 599) {
    return chalk.red.bold
  }
}

module.exports = log
