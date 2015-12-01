
var fs = require('fs')
  , path = require('path')
  , http = require('http')
var should = require('should')
  , debug = require('debug')
var request = require('@request/client')

console.server = debug('server')
console.client = debug('client')


describe('- proxy', function () {

  describe('basic', function () {
    var proxy, server
    before(function (done) {
      proxy = http.createServer()
      proxy.on('request', function (req, res) {
        request({
          uri: req.url,
          callback: function (err, _res, body) {
            res.writeHead(200, {
              'x-proxy': true,
              'x-server': _res.headers['x-server']
            })
            res.end()
          }
        })
      })
      proxy.listen(7676, function () {

        server = http.createServer()
        server.on('request', function (req, res) {
          res.writeHead(200, {'x-server': true})
          res.end()
        })
        server.listen(6767, done)
      })
    })

    it('0', function (done) {
      var req = request({
        url: 'http://localhost:6767',
        proxy: 'http://localhost:7676',
        callback: function (err, res, body) {
          res.headers['x-proxy'].should.equal('true')
          res.headers['x-server'].should.equal('true')
          done()
        }
      })
    })

    after(function (done) {
      proxy.close(function () {
        server.close(done)
      })
    })
  })

})
