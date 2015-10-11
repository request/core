
var url = require('url')
var utils = require('../utils')


function redirect (req, options, res) {
  if (!res) {
    req._redirect = true

    if (typeof options.redirect !== 'object') {
      options.redirect = {max: 5, followed: 0}
    }
    else {
      if (options.redirect.max === undefined) {
        options.redirect.max = 5
      }
      options.redirect.followed = 0
    }
  }
  else {
    var loc = location(res, options)

    if (loc) {
      options.redirect.followed += 1
      if (options.redirect.followed === options.redirect.max) {
        // req.emit('error', new Error(
        //   'redirect: Exceeded maxRedirects. ' +
        //   'Probably stuck in a redirect loop ' + options.url.href))

        req._redirected = true
        req._redirect = false
        req._chunks = []
        if (req._src) {
          req._src.close()
        }
        return
      }

      storeOriginalHost(req, options)

      // relative path
      if (!/^https?:/.test(loc)) {
        loc = url.resolve(options.url.href, loc)
      }
      loc = url.parse(loc)

      cleanup(req, res, options, loc)
      // modify(req, res, options)

      options.url = loc

      req._redirected = true
      req.emit('redirect', res)
      req.emit('options', options)
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
  }
}

function location (res, options) {
  var location = res.headers.get('location')

  if (res.statusCode >= 300 && res.statusCode < 400 && location) {
    if (options.redirect.all) {
      return location
    }
    else if (!/PATCH|PUT|POST|DELETE/.test(options.method)) {
      return location
    }
  }
  // basic auth
  else if (res.statusCode === 401) {
    if (options.headers.get('authorization')) {
      return options.url.path
    }
  }
}

function storeOriginalHost (req, options) {
  if (!req._redirected) {
    // Save the original host before any redirect (if it changes, we need to
    // remove any authorization headers). Also remember the case of the header
    // name because lots of broken servers expect Host instead of host and we
    // want the caller to be able to specify this.
    options.redirect.host = {
      name: req._req._headerNames.host,
      value: req._req._headers.host
    }
  }
}

function cleanup (req, res, options, location) {
  // Remove parameters from the previous response,
  // unless this is the second request
  // for a server that requires digest authentication.
  if (res.statusCode !== 401 && res.statusCode !== 307) {
    // Remove authorization if changing hostnames,
    // but not if just changing ports or protocols.
    // This matches the behavior of curl:
    // https://github.com/bagder/curl/blob/6beb0eee/lib/http.c#L710
    if (location.hostname !== options.redirect.host.value.split(':')[0]) {
      options.headers.remove('authorization')
    }
  }

  if (!options.redirect.removeReferer) {
    options.headers.set('referer', options.url.href)
  }
}

function modify (req, res, options) {
  if (options.redirect.followed >= options.redirect.max) {
    req.emit('error', new Error(
      'redirect: Exceeded maxRedirects. ' +
      'Probably stuck in a redirect loop ' + options.url.href))
    return false
  }
  options.redirect.followed += 1
}


function notImplemented0 (req, res, options) {
  // handle the case where we change protocol from https to http or vice versa
  var uriPrev = req.uri
  req.uri = url.parse(redirectTo)
  if (req.uri.protocol !== uriPrev.protocol) {
    req._updateProtocol()
  }

  // store redirects
  self.redirects.push({
    statusCode: res.statusCode,
    location: location
  })

  if (options.redirect.all &&
      options.method !== 'HEAD' &&
      res.statusCode !== 401 && res.statusCode !== 307) {
    options.method = 'GET'
  }
}

function notImplemented1 (req, res, options) {
  // Remove parameters from the previous response,
  // unless this is the second request
  // for a server that requires digest authentication.
  if (res.statusCode !== 401 && res.statusCode !== 307) {

    delete options.body
    if (req._src) {
      req._src.close()
      delete req._src
    }

    options.headers.remove('host')
    options.headers.remove('content-type')
    options.headers.remove('content-length')

    // Remove authorization if changing hostnames,
    // but not if just changing ports or protocols.
    // This matches the behavior of curl:
    // https://github.com/bagder/curl/blob/6beb0eee/lib/http.c#L710
    if (options.url.hostname !== options.redirect.host.value.split(':')[0]) {
      options.headers.remove('authorization')
    }
  }
}

function notImplemented2 () {
  self.setHost = false
  if (!options.headers.get('host')) {
    var hostHeaderName = options.redirect.host.name || 'host'
    options.headers.set(hostHeaderName, options.url.hostname)

    if (options.url.port) {
      if (!(options.url.port === 80 && options.url.protocol === 'http:') &&
          !(options.url.port === 443 && options.url.protocol === 'https:')) {
        options.headers.set(
          hostHeaderName, options.headers.get('host') + (':' + options.url.port)
        )
      }
    }
    self.setHost = true
  }
  if (self.setHost) {
    self.removeHeader('host')
  }
}

module.exports = redirect
