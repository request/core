
## Options

- **protocol**
  - `http:`
  - `https:`
- **gzip** pipes the response body to [zlib][zlib] Inflate or Gunzip stream
  - `true` detects the compression method from the `content-encoding` header
  - `deflate/gzip` user defined compression method to use
  - `function(req, value)` define your own stream handler
- **encoding** pipes the response body to [iconv-lite][iconv-lite] stream
  - `true` defaults to `utf8`
  - `binary/ISO-8859-1/win1251...` specific encoding to use. Use `binary` if you expect binary data
  - `function(req, value)` define your own stream handler
- **callback** buffers the response body
  - `function(err, res, body)` by default the response buffer is decoded into string using `utf8`. Set the `encoding` property to `binary` if you expect binary data, or any other specific encoding


## Events

- **redirect**


  [iconv-lite]: https://www.npmjs.com/package/iconv-lite
  [zlib]: https://iojs.org/api/zlib.html
