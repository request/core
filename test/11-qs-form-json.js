
var fs = require('fs')
  , path = require('path')
  , http = require('http')
var should = require('should')
  , debug = require('debug')
  , qs = require('qs')
var request = require('request-client')

var image0 = path.join(__dirname, './fixtures/cat0.png')
  , image1 = path.join(__dirname, './fixtures/cat1.png')
  , image2 = path.join(__dirname, './fixtures/cat2.png')
var tmp = path.join(__dirname, './tmp/cat.png')

console.server = debug('server')
console.client = debug('client')


describe('- qs-form-json', function () {

  describe('qs option', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        res.end(req.url.split('?')[1])
      })
      server.listen(6767, done)
    })

    it('0', function (done) {
      var req = request({
        url: 'http://localhost:6767',
        qs: {poop: 'wqw'},
        callback: function (err, res, body) {
          should.deepEqual(qs.parse(body), {poop: 'wqw'})
          done()
        }
      })
    })

    after(function (done) {
      server.close(done)
    })
  })

  describe('qs option + qs string', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        res.end(req.url.split('?')[1])
      })
      server.listen(6767, done)
    })

    it('1', function (done) {
      var req = request({
        url: 'http://localhost:6767/?really=amazing',
        qs: {poop: 'wqw'},
        callback: function (err, res, body) {
          should.deepEqual(qs.parse(body), {poop: 'wqw', really: 'amazing'})
          done()
        }
      })
    })

    after(function (done) {
      server.close(done)
    })
  })

  describe('form option', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        req.headers['content-type']
          .should.equal('application/x-www-form-urlencoded')
        var data = ''
        req.on('data', function (chunk) {
          data += chunk
        })
        req.on('end', function () {
          res.end(data)
        })
      })
      server.listen(6767, done)
    })

    it('2', function (done) {
      var req = request({
        url: 'http://localhost:6767',
        form: {poop: 'wqw'},
        callback: function (err, res, body) {
          should.deepEqual(qs.parse(body), {poop: 'wqw'})
          done()
        }
      })
    })

    after(function (done) {
      server.close(done)
    })
  })

  describe('json option', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        req.headers['accept'].should.equal('application/json')
        req.headers['content-type'].should.equal('application/json')
        var data = ''
        req.on('data', function (chunk) {
          data += chunk
        })
        req.on('end', function () {
          res.writeHead(200, {'content-type': 'application/json'})
          res.end(data)
        })
      })
      server.listen(6767, done)
    })

    it('3', function (done) {
      var req = request({
        url: 'http://localhost:6767',
        json: {poop: 'wqw'},
        callback: function (err, res, body) {
          should.deepEqual(body, {poop: 'wqw'})
          done()
        }
      })
    })

    after(function (done) {
      server.close(done)
    })
  })
})
