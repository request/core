
var fs = require('fs')
  , path = require('path')
  , http = require('http')
var should = require('should')
  , debug = require('debug')
  , auth = require('http-auth')
  , hawk = require('hawk')
  , httpSignature = require('http-signature')
  , oauth = require('oauth-sign')
var request = require('@http/client')

var htpasswd = path.join(__dirname, './fixtures/.htpasswd')
  , htpasswd_digest = path.join(__dirname, './fixtures/.htpasswd_digest')
  , http_sig_pub = path.join(__dirname, './fixtures/http-signature-public.pem')
  , http_sig_pri = path.join(__dirname, './fixtures/http-signature-private.pem')

console.server = debug('server')
console.client = debug('client')


describe('- auth', function () {

  describe('basic + sendImmediately:false', function () {
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
          res.end(req.headers['authorization'])
        }
        else {
          res.end()
        }
      })
      server.listen(6767, done)
    })

    it('0', function (done) {
      var req = request({
        url: 'http://localhost:6767',
        auth: {user: 'user', pass: 'pass', sendImmediately: false},
        redirect: true,
        callback: function (err, res, body) {
          var encoded = body.split(' ')[1]
          var auth = Buffer(encoded, 'base64').toString('utf8')
          auth.should.equal('user:pass')
          done()
        }
      })
    })

    after(function (done) {
      server.close(done)
    })
  })

  describe('digest + sendImmediately:false', function () {
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
        }
        else {
          res.end()
        }
      })
      server.listen(6767, done)
    })

    it('1', function (done) {
      var req = request({
        url: 'http://localhost:6767',
        auth: {user: 'user', pass: 'pass', sendImmediately: false},
        redirect: true,
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
        }
        else {
          res.end()
        }
      })
      server.listen(6767, done)
    })

    it('2', function (done) {
      var req = request({
        url: 'http://localhost:6767',
        auth: {bearer: 'token'},
        // redirect: true,
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

  describe('bearer + sendImmediately:false', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        if (req.headers['authorization']) {
          res.end(req.headers['authorization'])
        }
        else {
          res.writeHead(401, {'www-authenticate': 'Bearer realm="nono"'})
          res.end()
        }
      })
      server.listen(6767, done)
    })

    it('3', function (done) {
      var req = request({
        url: 'http://localhost:6767',
        auth: {bearer: 'token', sendImmediately: false},
        redirect: true,
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

  describe('hawk', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        function getCred (id, done) {
          id.should.equal('dh37fgj492je')
          var credentials = {
            key: 'werxhqb98rpaxn39848xrunpaw3489ruxnpa98w4rxn',
            algorithm: 'sha256',
            user: 'simov'
          }
          return done(null, credentials)
        }

        hawk.server.authenticate(req, getCred, {},
        function (err, credentials, attributes) {
          res.end(credentials.user)
        })
      })
      server.listen(6767, done)
    })

    it('4', function (done) {
      var req = request({
        url: 'http://localhost:6767',
        hawk: {credentials: {
          key: 'werxhqb98rpaxn39848xrunpaw3489ruxnpa98w4rxn',
          algorithm: 'sha256',
          id: 'dh37fgj492je'
        }},
        callback: function (err, res, body) {
          body.should.equal('simov')
          done()
        }
      })
    })

    after(function (done) {
      server.close(done)
    })
  })

  describe('httpSignature', function () {
    var publicKey = fs.readFileSync(http_sig_pub, 'ascii')
      , privateKey = fs.readFileSync(http_sig_pri, 'ascii')

    var publicKeyPEMs = {'key-1': publicKey}
      , privateKeyPEMs = {'key-1': privateKey}

    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        var parsed = httpSignature.parseRequest(req)
          , publicKeyPEM = publicKeyPEMs[parsed.keyId]
          , verified = httpSignature.verifySignature(parsed, publicKeyPEM)
        res.writeHead(verified ? 200 : 400)
        res.end()
      })
      server.listen(6767, done)
    })

    it('5', function (done) {
      var req = request({
        url: 'http://localhost:6767',
        httpSignature: {
          keyId: 'key-1',
          key: privateKeyPEMs['key-1']
        },
        callback: function (err, res, body) {
          res.statusCode.should.equal(200)
          done()
        }
      })
    })

    after(function (done) {
      server.close(done)
    })
  })

  describe('aws', function () {
    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        res.end(req.headers.authorization)
      })
      server.listen(6767, done)
    })

    it('6', function (done) {
      var req = request({
        url: 'http://localhost:6767',
        aws: {
          key: 'key',
          secret: 'secret'
        },
        callback: function (err, res, body) {
          body.should.match(/^AWS key:.*=$/)
          done()
        }
      })
    })

    after(function (done) {
      server.close(done)
    })
  })

  describe('oauth', function () {
    var reqsign = oauth.hmacsign(
      'GET',
      'http://localhost:6767/',
      {
        a: 1,
        oauth_callback: 'http://localhost:6767/callback',
        oauth_consumer_key: 'GDdmIQH6jhtmLUypg82g',
        oauth_nonce: 'QP70eNmVz8jvdPevU3oJD2AfF7R7odC2XJcn4XlZJqk',
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: '1272323042',
        oauth_version: '1.0'
      },
      'MCD8BKwGdgPHvAuvgvz4EQpqDAtx89grbuNMRd7Eh98'
    )

    var server
    before(function (done) {
      server = http.createServer()
      server.on('request', function (req, res) {
        res.end(req.headers.authorization)
      })
      server.listen(6767, done)
    })

    it('7', function (done) {
      var req = request({
        url: 'http://localhost:6767',
        qs: {a: 1},
        oauth: {
          consumer_key: 'GDdmIQH6jhtmLUypg82g',
          consumer_secret: 'MCD8BKwGdgPHvAuvgvz4EQpqDAtx89grbuNMRd7Eh98',
          callback: 'http://localhost:6767/callback',
          timestamp: '1272323042',
          nonce: 'QP70eNmVz8jvdPevU3oJD2AfF7R7odC2XJcn4XlZJqk'
        },
        callback: function (err, res, body) {
          var signature = decodeURIComponent(
            body.replace(/.*oauth_signature="([^"]+)".*/, '$1'))
          reqsign.should.equal(signature)
          done()
        }
      })
    })

    after(function (done) {
      server.close(done)
    })
  })

})
