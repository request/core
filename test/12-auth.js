
var fs = require('fs')
  , path = require('path')
  , http = require('http')
var should = require('should')
  , debug = require('debug')
  , auth = require('http-auth')
var request = require('../index')

var image0 = path.join(__dirname, './fixtures/cat0.png')
  , image1 = path.join(__dirname, './fixtures/cat1.png')
  , image2 = path.join(__dirname, './fixtures/cat2.png')
var tmp = path.join(__dirname, './tmp/cat.png')
  , htpasswd = path.join(__dirname, './fixtures/.htpasswd')
  , htpasswd_digest = path.join(__dirname, './fixtures/.htpasswd_digest')

console.server = debug('server')
console.client = debug('client')


describe('- auth', function () {

  describe('basic', function () {
    var server
    before(function (done) {
      // htpasswd -c -b .htpasswd user pass
      var basic = auth.basic({
        realm: 'Private area',
        file: htpasswd // user: user, pass: pass
      })
      server = http.createServer(basic)
      server.on('request', function (req, res) {
        if (req.headers['authorization']) {
          var encoded = req.headers['authorization'].split(' ')[1]
          res.end(Buffer(encoded, 'base64').toString('utf8'))
        } else {
          res.end()
        }
      })
      server.listen(6767, done)
    })

    it('0', function (done) {
      var req = request({
        url: 'http://localhost:6767',
        redirect: true,
        auth: {user: 'user', pass: 'pass', sendImmediately: false},
        callback: function (err, res, body) {
          body.should.equal('user:pass')
          done()
        }
      })
    })

    after(function (done) {
      server.close(done)
    })
  })

  describe('digest', function () {
    var server
    before(function (done) {
      // htdigest -c .htpasswd_digest realm user
      var digest = auth.digest({
        realm: 'realm',
        file: htpasswd_digest // user: user, pass: pass
      })
      server = http.createServer(digest)
      server.on('request', function (req, res) {
        if (req.headers['authorization']) {
          res.end(req.headers['authorization'])
        } else {
          res.end()
        }
      })
      server.listen(6767, done)
    })

    it('1', function (done) {
      var req = request({
        url: 'http://localhost:6767',
        redirect: true,
        auth: {user: 'user', pass: 'pass', sendImmediately: false},
        callback: function (err, res, body) {
          body.should.match(/Digest username="user"/)
          done()
        }
      })
    })

    after(function (done) {
      server.close(done)
    })
  })

  describe('bearer', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        if (req.headers['authorization']) {
          res.end(req.headers['authorization'])
        } else {
          res.end()
        }
      })
      server.listen(6767, done)
    })

    it('2', function (done) {
      var req = request({
        url: 'http://localhost:6767',
        // redirect: true,
        auth: {bearer: 'token'},
        callback: function (err, res, body) {
          body.should.equal('Bearer token')
          done()
        }
      })
    })

    after(function (done) {
      server.close(done)
    })
  })

})
