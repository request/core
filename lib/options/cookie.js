'use strict'

var tough = require('tough-cookie')


function cookie (req, options, res) {
  if (res) {
    var cookies = res.headers.get('set-cookie')
    if (cookies) {
      cookies = (cookies instanceof Array) ? cookies : [cookies]
      cookies.forEach(function (cookie) {
        try {
          options.jar.setCookieSync(cookie, options.url.href, {ignoreError: true})
        }
        catch (e) {
          req.emit('error', e)
        }
      })
    }
  }

  if (!options.jar) {
    options.jar = new tough.CookieJar(undefined, {looseMode: true})
    options.cookie = {
      header: options.headers.get('cookie') // originalHeader
    }
  }

  var cookies = options.jar.getCookieStringSync(options.url.href)

  if (cookies && cookies.length) {
    var header = ''
    if (options.cookie.header) {
      header = options.cookie.header + '; '
    }
    options.headers.set('cookie', header + cookies)
  }
}

module.exports = cookie
