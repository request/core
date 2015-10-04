
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
- **options** emit *@http/core* options
- **body** emit raw response body, either *Buffer* or *String* (the *callback* option is required)
- **json** emit parsed JSON response body (the *callback* option is required)

## req/res

- **headers** is instance of the *@http/headers* module


## Options

- **url/uri**
  - `https://site.com`
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
  - `true` follow redirects for `GET`, `HEAD`, `OPTIONS` and `TRACE` requests
  - `Object`
    - *all* follow all redirects
    - *max* maximum redirects allowed
    - *removeReferer* remove the `referer` header on redirect
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
- **length**
  - `true` defaults to `false` if omitted
  - `length(req, options)`
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
- **parse**
  - `{json:true}`
    - sets the `accept: application/json` header for the request
    - parses JSON or JSONP response bodies (only if the server responds with the approprite headers)


## Generated Options

- **url** contains the parsed URL
- **redirect** is converted to object containing all possible options including the `followed` state variable, containing the followed redirects count
- **auth** containes `sent` state variable indicating whether the Basic auth is sent already


## Logger

- **req** prints out the request `method`, `url`, and `headers`
- **res** prints out the response `statusCode`, `statusMessage`, and `headers`
- **http** prints out the options object passed to the underlying `http.request` method
- **raw** prints out the raw `@http/core` options object right before sending the request
- **body** prints out the raw request and response bodies (the response body is available only when the `callback` option is being used)
- **json** prints out the parsed JSON response body (only if the response body is a JSON one, and if the `callback` and `parse.json` options are being used)

```bash
$ DEBUG=req,res node app.js
```


## Errors

###### oauth

- `oauth: transport_method: body requires method: POST and content-type: application/x-www-form-urlencoded`
- `oauth: signature_method: PLAINTEXT not supported with body_hash signing`


## Notice

This module may contain code snippets initially implemented in [request][request] by [request contributors][request-contributors].


  [request]: https://github.com/request/request
  [request-contributors]: https://github.com/request/request/graphs/contributors

  [iconv-lite]: https://www.npmjs.com/package/iconv-lite
  [zlib]: https://iojs.org/api/zlib.html
