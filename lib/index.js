
module.exports = {
  options: {
    auth: require('./options/auth'),
    body: require('./options/body'),
    callback: require('./options/callback'),
    cookie: require('./options/cookie'),
    encoding: require('./options/encoding'),
    end: require('./options/end'),
    form: require('./options/form'),
    gzip: require('./options/gzip'),
    json: require('./options/json'),
    length: require('./options/length'),
    multipart: require('./options/multipart'),
    parse: require('./options/parse'),
    proxy: require('./options/proxy'),
    qs: require('./options/qs'),
    redirect: require('./options/redirect'),
    timeout: require('./options/timeout'),
    tunnel: require('./options/tunnel')
  },
  config: require('./config'),
  HTTPDuplex: require('./http-duplex'),
  modules: require('./modules'),
  request: require('./request'),
  response: require('./response'),
  utils: require('./utils')
}
