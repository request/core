
var fs = require('fs')
  , path = require('path')
  , http = require('http')
var should = require('should')
  , debug = require('debug')
  , tough = require('tough-cookie')
var request = require('@http/client')

console.server = debug('server')
console.client = debug('client')


describe('- cookie', function () {

  describe('cookie header', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        if (req.url === '/redirect') {
          res.writeHead(301, {
            location: '/',
            'set-cookie': 'c=d;'
          })
          res.end()
        }
        else {
          res.end(req.headers.cookie)
        }
      })
      server.listen(6767, done)
    })

    it('0', function (done) {
      var req = request({
        url: 'http://localhost:6767/redirect',
        headers: {cookie: 'a=b; Domain=localhost'},
        redirect: true,
        cookie: true,
        callback: function (err, res, body) {
          body.should.equal('a=b; Domain=localhost; c=d')
          done()
        }
      })
    })

    after(function (done) {
      server.close(done)
    })
  })

  describe('cookie jar', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        if (req.url === '/redirect') {
          res.writeHead(301, {
            location: '/',
            'set-cookie': 'e=f;'
          })
          res.end()
        }
        else {
          res.end(req.headers.cookie)
        }
      })
      server.listen(6767, done)
    })

    it('1', function (done) {
      var jar = new tough.CookieJar()
      jar.setCookieSync('c=d', 'http://localhost:6767/redirect')

      var req = request({
        url: 'http://localhost:6767/redirect',
        headers: {cookie: 'a=b; Domain=localhost'},
        redirect: true,
        cookie: jar,
        callback: function (err, res, body) {
          body.should.equal('a=b; Domain=localhost; c=d; e=f')
          done()
        }
      })
    })

    after(function (done) {
      server.close(done)
    })
  })

})
