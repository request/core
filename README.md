
## Properties

- **HTTPDuplex**
  - `_initialized` set when the outgoing HTTP request is fully initialized
  - `_started` set after first write/end

  - `_req` http.ClientRequest created in HTTPDuplex
  - `_res` http.IncomingMessage created in HTTPDuplex
  - `_client` http or https module

  - `_redirect` boolean indicating that the client is going to be redirected
  - `_redirected` boolean indicating that the client is been redirected at least once
  - `_src` the input read stream, usually from pipe
  - `_chunks` Array - the first chunk read from the input read stream
  - `_ended` whether the outgoing request has ended

  - `init` - method

## Events

- **init** should be private I guess
- **request** req, options
- **redirect** res

## req/res

- **headers** is instance of the *Headers* module


## Options

- **url/uri**
  - `https://site.com`
- **protocol**
  - `http`
  - `https`
- **gzip** pipes the response body to [zlib][zlib] Inflate or Gunzip stream
  - `true` detects the compression method from the `content-encoding` header
  - `deflate/gzip` user defined compression method to use
  - `function(req, options)` define your own stream handler
- **encoding** pipes the response body to [iconv-lite][iconv-lite] stream
  - `true` defaults to `utf8`
  - `binary/ISO-8859-1/win1251...` specific encoding to use. Use `binary` if you expect binary data
  - `function(req, options)` define your own stream handler
- **callback** buffers the response body
  - `function(err, res, body)` by default the response buffer is decoded into string using `utf8`. Set the `encoding` property to `binary` if you expect binary data, or any other specific encoding
- **redirect**
  - `true`
  - `{all: true, max: 5, removeReferer}`
- **body**
  - `Stream`
  - `Buffer`
  - `string`
  - `Array`
  - `function(req, options)`
- **multipart**
  - body can be `Stream`, `Request`, `Buffer`, `String`
    ```js
    // related
    multipart: [{key: 'value', body: 'body'}]
    multipart: [{key: 'value', body: 'body'}]

    // form-data
    multipart: {key: 'value'}
    multipart: {key: ['value', 'value']}
    multipart: {key: {
      value: 'value',
      options: {filename: '', contentType: '', knownLength: 0}
    }}
    ```
- **contentLength**
  - `true` defaults to `false` if omitted
  - `contentLength(req, options)`
- **end** enabled by default
  - `false` prevent request ending on nextTick
- **qs**
  - `Object`
  - `String`
- **form**
  - `Object`
  - `String`
- **json**
  - `Object`
  - `String`
- **auth**
  - `{user: '', pass: '', sendImmediately: false}`
  - `{bearer: ''}`
- **hawk**
- **httpSignature**
- **aws**
- **oauth**


## Generated Options

- **uri** contains the parsed URL
- **redirect** is converted to object containing all possible options
  - contains *followed* key


## Modules

- **http-duplex** http duplex stream
- **gzip** gzip stream
- **encoding** encoding stream
- **callback** buffer response
- **redirect**
- **body**


## Logger

- **req**
- **res**
- **options**

```bash
$ DEBUG=req,res node app.js
```


## Notice

This module may contain code snippets initially implemented in [request][request] by [request contributors][request-contributors].


  [request]: https://github.com/request/request
  [request-contributors]: https://github.com/request/request/graphs/contributors

  [iconv-lite]: https://www.npmjs.com/package/iconv-lite
  [zlib]: https://iojs.org/api/zlib.html
