
var url = require('url')
var utils = require('../utils')


function redirect (req, options) {
  req._redirect = true

  req.on('response', function (res) {
    var loc = location(res, options)

    if (loc) {
      req._redirected = true
      req.emit('redirect', res)
      // modify(req, res, options)
      // cleanup(req, res, options)

      options.path = loc
      req.init(utils.filter(options))

      req._chunks.forEach(function (chunk) {
        req.write(chunk)
      })
      if (req._ended) {
        req.end()
      }
    }
    else {
      req._redirect = false
      req._chunks = []
      if (req._src) {
        req._src.resume()
      }
    }
  })
}

function location (res, options) {
  var location = res.headers.get('location')
    , redirect = (typeof options.redirect === 'object') ? redirect : {}

  if (res.statusCode >= 300 && res.statusCode < 400 && location) {
    if (redirect.all) {
      return location
    }
    else if (!/PATCH|PUT|POST|DELETE/.test(options.method)) {
      return location
    }
  }
  // basic auth
  else if (options.auth && res.statusCode === 401) {
    var auth = require('./auth')
    auth(null, options, res)
    if (options.headers.get('authorization')) {
      return options.path
    }
  }
}

function modify (req, res, options) {
  if (options.redirect.followed >= options.redirect.max) {
    // req.emit('error', new Error(
    //   'Exceeded maxRedirects. Probably stuck in a redirect loop '
    // + options.uri.href))
    return false
  }
  options.redirect.followed += 1

  // relative path
  if (!/^https?:/.test(location)) {
    location = url.resolve(req.uri.href, location)
  }

  // handle the case where we change protocol from https to http or vice versa
  // var uriPrev = req.uri
  // req.uri = url.parse(redirectTo)
  // if (req.uri.protocol !== uriPrev.protocol) {
  //   req._updateProtocol()
  // }

  // store redirects
  // self.redirects.push({
  //   statusCode: res.statusCode,
  //   location: location
  // })

  if (options.redirect.all &&
      options.method !== 'HEAD' &&
      res.statusCode !== 401 && res.statusCode !== 307) {
    options.method = 'GET'
  }
}

function cleanup (req, res, options) {
  // Remove parameters from the previous response,
  // unless this is the second request
  // for a server that requires digest authentication.
  if (res.statusCode !== 401 && res.statusCode !== 307) {

    delete options.body
    delete req._src

    options.headers.remove('host')
    options.headers.remove('content-type')
    options.headers.remove('content-length')

    // Remove authorization if changing hostnames (but not if just
    // changing ports or protocols).  This matches the behavior of curl:
    // https://github.com/bagder/curl/blob/6beb0eee/lib/http.c#L710
    if (req.uri.hostname !== req.originalHost.split(':')[0]) {

      options.headers.remove('authorization')
    }
  }

  if (typeof options.redirect === 'boolean' ||
      !options.redirect.removeReferer) {
    options.headers.set('referer', options.uri.href)
  }
}

module.exports = redirect
