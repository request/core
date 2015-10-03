
var url = require('url')
var debug = require('debug')
  , chalk = require('chalk')
  , prettyjson = require('prettyjson')

var is = {
  req: debug('req'),
  res: debug('res'),
  options: debug('options') || debug('options:http'),
  raw: debug('options:raw')
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
    if (is.options.name === 'enabled') {
      console.log(chalk.gray.inverse('options'))
      console.log(prettyjson.render(_options, options, 4))
    }

    if (is.req.name === 'enabled') {
      var mt = method(req.method)
      console.log(
        chalk.yellow.inverse('req'),
        mt(req.method),
        chalk.yellow(uri(req)))
      // console.log(req._headers) contains the 'host' header as well
      // but all headers are lowervase'd
      console.log(prettyjson.render(_options.headers, options, 4))
    }
  })

  req.on('response', function (res) {
    var code = res.statusCode

    var st = status(res.statusCode)
    if (is.res.name === 'enabled') {
      console.log(
        st.inverse('res'),
        st(res.statusCode + ' ' + res.statusMessage))
      console.log(prettyjson.render(res.headers, options, 4))
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
