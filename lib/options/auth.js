'use strict'

var url = require('url')


function auth (req, options, res) {
  var auth = options.auth || {}
    , header

  // request
  if (!res) {
    if (auth.user) {
      header = basic(auth)
    }
    else if (auth.bearer) {
      header = bearer(auth)
    }
    else if (options.hawk) {
      header = hawk(options)
    }
    else if (options.httpSignature) {
      header = httpSignature(options)
    }
    else if (options.aws) {
      header = aws(options)
    }
    else if (options.oauth) {
      oauth(req, options)
    }
  }
  // response
  else {
    if (auth.sent) {
      options.headers.remove('authorization')
      return
    }

    var authHeader = res.headers.get('www-authenticate')
      , authVerb = authHeader && authHeader.split(' ')[0].toLowerCase()

    auth.sendImmediately = true

    if (authVerb === 'basic') {
      header = basic(auth)
    }
    else if (authVerb === 'bearer') {
      header = bearer(auth)
    }
    else if (authVerb === 'digest') {
      header = digest(auth.user, auth.pass, options.method, options.path, authHeader)
    }
  }

  if (header) {
    options.headers.set('Authorization', header)
  }
}

function basic (auth) {
  function toBase64 (str) {
    return (new Buffer(str || '', 'utf8')).toString('base64')
  }

  if (auth.sendImmediately === undefined || auth.sendImmediately) {
    auth.sent = true
    var header = 'Basic ' + toBase64(auth.user + ':' + (auth.pass || ''))
    return header
  }
}

function bearer (auth) {
  if (auth.sendImmediately === undefined || auth.sendImmediately) {
    auth.sent = true
    var header = 'Bearer ' + (auth.bearer || '')
    return header
  }
}

function digest (user, pass, method, path, authHeader) {
  var _digest = require('@http/digest')
  var header = 'Digest ' + _digest(user, pass, method, path, authHeader)
  return header
}

function hawk (options) {
  var hawk = require('hawk')

  var header = hawk.client.header(
    options.url, options.method, options.hawk).field

  return header
}

function httpSignature (options) {
  var httpSignature = require('http-signature')

  httpSignature.signRequest({
    getHeader: function (header) {
      return options.headers.get(header)
    },
    setHeader: function (header, value) {
      options.headers.set(header, value)
    },
    method: options.method,
    path: options.path
  },
  options.httpSignature)
}

function aws (options) {
  var aws = require('aws-sign2')

  var date = new Date()
  options.headers.set('date', date.toUTCString())

  var auth = {
    key: options.aws.key,
    secret: options.aws.secret,
    verb: options.method.toUpperCase(),
    date: date,
    contentType: options.headers.get('content-type') || '',
    md5: options.headers.get('content-md5') || '',
    amazonHeaders: aws.canonicalizeHeaders(options.headers.toObject())
  }
  var path = options.url.path
  if (options.aws.bucket && path) {
    auth.resource = '/' + options.aws.bucket + path
  }
  else if (options.aws.bucket && !path) {
    auth.resource = '/' + options.aws.bucket
  }
  else if (!options.aws.bucket && path) {
    auth.resource = path
  }
  else if (!options.aws.bucket && !path) {
    auth.resource = '/'
  }
  auth.resource = aws.canonicalizeResource(auth.resource)

  var header = aws.authorization(auth)
  return header
}

function oauth (req, options) {
  var _oauth = require('@http/oauth')

  var form, contentType = options.headers.get('content-type')
  if (options.form || /^application\/x-www-form-urlencoded/.test(contentType)) {
    form = options.body.toString()
  }

  var result = _oauth({
    oauth: options.oauth, url: options.url, method: options.method,
    query: options.url.query, form: form, body: options.body
  })

  if (result instanceof Error) {
    req.emit('error', result.error)
    return
  }

  var transport = options.oauth.transport_method || 'header'
  if (transport === 'header') {
    options.headers.set('Authorization', result)
  }
  else if (transport === 'query') {
    var href = options.url.href += result
    options.url = url.parse(href)
    options.path = options.url.path
  }
  else if (transport === 'body') {
    options.body += result
  }
}

module.exports = auth
