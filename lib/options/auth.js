'use strict'

var url = require('url')


exports.request = function (req, options) {
  if (options.url.auth) {
    if (!options.headers.get('authorization')) {
      var parts = options.url.auth.split(':')
      options.auth = {user: parts[0], pass: parts[1]}
    }
  }

  var auth = options.auth || {}
    , header

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

  if (header) {
    options.headers.set('Authorization', header)
  }
}

exports.response = function (req, res, options) {
  var auth = options.auth || {}
    , header

  if (res.statusCode === 401 && auth.sent) {
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
    header = digest(auth.user, auth.pass, options.method, options.url.path, authHeader)
  }

  if (header) {
    options.headers.set('Authorization', header)
  }

  if (options.oauth) {
    oauth(req, options)
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
  var _digest = require('@request/digest')
  var header = _digest(user, pass, method, path, authHeader)
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
  var _oauth = require('@request/oauth')

  var form, contentType = options.headers.get('content-type')
  if (options.form || /^application\/x-www-form-urlencoded/.test(contentType)) {
    if (options.body) {
      form = options.body.toString()
    }
    if (!form) {
      form = ''
    }
  }

  var result = _oauth({
    oauth: options.oauth, url: options.url, method: options.method,
    query: options.url.query, form: form, body: options.body
  })

  if (result instanceof Error) {
    req.emit('error', result)
    return
  }

  var transport = options.oauth.transport_method || 'header'
  if (transport === 'header') {
    options.headers.set('Authorization', result)
  }
  else if (transport === 'query') {
    var href = options.url.href += result
    options.url = url.parse(href)
  }
  else if (transport === 'body') {
    options.body = options.body || ''
    options.body += result
  }
}
