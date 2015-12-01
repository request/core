
# @request/core

HTTP Duplex Streams2 client. By default it behaves identically to Node's Core [http.request][node-http-request] method.

Each additional feature must be enabled explicitly via option. Some options requires additional dependencies.


---


# Options


## URL

#### url/uri
  - `String`
  - `url.Url`

#### qs
  - `Object`
  - `String`

## Body

#### form
  - `Object`
  - `String` pass URL encoded string if you want it to be RFC3986 encoded prior sending

#### json
  - `Object`

#### body
  - `Stream`
  - `Buffer`
  - `String`
  - `Array`

#### multipart - requires [@request/multipart][request-multipart]

Pass `Object` for `multipart/form-data` body:

```js
// set item
multipart: {photo: fs.createReadStream('cat.png')}
// pass additional info about the uploaded item
multipart: {
  photo: {
    value: fs.createReadStream('cat.png'),
    options: {filename: 'cat.png', contentType: 'image/png', knownLength: 22025}
  }
}
// pass array of values for this item
multipart: {attachments: [fs.createReadStream('cat.png'), fs.createReadStream('dog.png')]}
```

The item's value can be either: `Stream`, `Request`, `Buffer` or `String`.

Pass `Array` for any other `multipart/[TYPE]`, defaults to `multipart/related`:

```js
// Example: Upload image to Google Drive
multipart: [
  {
    'Content-Type': 'application/json',
    body: JSON.stringify({title: 'cat.png'})
  },
  {
    'Content-Type': 'image/png',
    body: fs.createReadStream('cat.png')
  }
]
```

The `body` key is required and reserved for setting up the item's body. It can be either: `Stream`, `Request`, `Buffer` or `String`.

Additionally you can set `preambleCRLF` and/or `postambleCRLF` to `true`.


## Authentication

#### auth - digest auth requires [@request/digest][request-digest]
- `{user: '', pass: '', sendImmediately: false}`
  - Sets the `Authorization: Basic ...` header.
  - The `sendImmediately` option default to `true` if omitted.
  - The `sendImmediately: false` options requires the [redirect option][redirect-option] to be enabled.
  - Digest authentication requires the [@request/digest][request-digest] module.
- `{bearer: '', sendImmediately: false}`
  - Alternatively the `Authorization: Bearer ...` header can be set if using the `bearer` option.
  - The rules for the `sendImmediately` option from above applies here.


#### oauth - requires [@request/oauth][request-oauth]

#### hawk - requires [hawk][hawk]

#### httpSignature - requires [http-signature][http-signature]

#### aws - requires [aws-sign2][aws-sign2]


## Modifiers

#### gzip
- `gzip: true`
  - Pipes the response body to [zlib][zlib] Inflate or Gunzip stream based on the compression method specified in the `content-encoding` response header.
- `gzip: 'gzip'` | `gzip: 'deflate'`
  - Explicitly specify which decompression method to use.

#### encoding - requires [iconv-lite][iconv-lite]
- `encoding: true`
  - Pipes the response body to [iconv-lite][iconv-lite] stream, defaults to `utf8`.
- `encoding: 'ISO-8859-1'` | `encoding: 'win1251'` | ...
  - Specific encoding to use.
- `encoding: 'binary'`
  - Set `encoding` to `'binary'` when expecting binary response.


## Misc

#### cookie - requires [tough-cookie][tough-cookie]
  - `true`
  - `new require('tough-cookie).CookieJar(store, options)`

#### length
  - `true` defaults to `false` if omitted

#### callback
  buffers the response body
  - `function(err, res, body)` by default the response buffer is decoded into string using `utf8`. Set the `encoding` property to `binary` if you expect binary data, or any other specific encoding

#### redirect
  - `true` follow redirects for `GET`, `HEAD`, `OPTIONS` and `TRACE` requests
  - `Object`
    - *all* follow all redirects
    - *max* maximum redirects allowed
    - *removeReferer* remove the `referer` header on redirect
    - *allow* `function (res)` user defined function to check if the redirect should be allowed

#### timeout
  - `Number` integer containing the number of milliseconds to wait for a server to send response headers (and start the response body) before aborting the request. Note that if the underlying TCP connection cannot be established, the OS-wide TCP connection timeout will overrule the timeout option

#### proxy
  - `String`
  - `url.Url`
  - `Object`

```js
{
  proxy: 'http://localhost:6767'
  //
  proxy: url.parse('http://localhost:6767')
  //
  proxy: {
    url: 'http://localhost:6767',
    headers: {
      allow: ['header-name'],
      exclusive: ['header-name']
    }
  }
}
```

#### tunnel - requires [tunnel-agent][tunnel-agent]
  - `true`

#### parse
  - `{json: true}`
    - sets the `accept: application/json` header for the request
    - parses `JSON` or `JSONP` response bodies (only if the server responds with the approprite headers)
  - `{json: function () {}}`
    - same as above but additionally passes a user defined reviver function to the `JSON.parse` method
  - `{qs: {sep:';', eq:':'}}`
    - `qs.parse` options to use
  - `{querystring: {sep:';', eq:':', options: {}}}` use the [querystring][node-querystring] module instead
    - `querystring.parse` options to use

#### stringify
  - `{qs: {sep:';', eq:':'}}`
    - `qs.stringify` options to use
  - `{querystring: {sep:';', eq:':', options: {}}}` use the [querystring][node-querystring] module instead
    - `querystring.stringify` options to use

#### end
  - `true` tries to automatically end the request on `nextTick`


---


# HTTPDuplex

###### Private Flags and State

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
- `_auth` whether basic auth is being used
- `_timeout` timeout timer instance


###### Public Methods

  - `init`
  - `abort`


---

# Request

## Methods

- **Request** the HTTPDuplex child class

## Events

- **init** should be private I guess
- **request** req, options
- **onresponse** res - internal event to execute options response logic
- **redirect** res
- **response** res
- **options** emit [@request/core][request-core] options
- **body** emit raw response body, either `Buffer` or `String` (the `callback` option is required)
- **json** emit parsed JSON response body (the `callback` and the `parse:{json:true}` options are required)

## req/res

- **headers** is instance of the [@request/headers][request-headers] module


---


## Generated Options

- **url** contains the parsed URL
- **redirect** is converted to object containing all possible options including the `followed` state variable, containing the followed redirects count
- **auth** containes `sent` state variable indicating whether the Basic auth is sent already
- **cookie** is converted to object and containes the initial cookie `header` as a property
- **jar** the internal [tough-cookie][tough-cookie] jar


---


## Logger

Requires [@request/log][request-log]

- **req** prints out the request `method`, `url`, and `headers`
- **res** prints out the response `statusCode`, `statusMessage`, and `headers`
- **http** prints out the options object passed to the underlying `http.request` method
- **raw** prints out the raw `@request/core` options object right before sending the request
- **body** prints out the raw request and response bodies (the response body is available only when the `callback` option is being used)
- **json** prints out the parsed JSON response body (only if the response body is a JSON one, and if the `callback` and `parse.json` options are being used)

```bash
$ DEBUG=req,res node app.js
```

---


## Errors

###### oauth

- `oauth: transport_method: body requires method: POST and content-type: application/x-www-form-urlencoded`
- `oauth: signature_method: PLAINTEXT not supported with body_hash signing`


---


## Notice

This module may contain code snippets initially implemented in [request][request] by [request contributors][request-contributors].


  [request]: https://github.com/request/request
  [request-contributors]: https://github.com/request/request/graphs/contributors
  [zlib]: https://iojs.org/api/zlib.html
  [node-http-request]: https://nodejs.org/api/http.html#http_http_request_options_callback

  [tough-cookie]: https://github.com/SalesforceEng/tough-cookie
  [iconv-lite]: https://www.npmjs.com/package/iconv-lite
  [hawk]: https://github.com/hueniverse/hawk
  [aws-sign2]: https://github.com/request/aws-sign
  [http-signature]: https://github.com/joyent/node-http-signature
  [tunnel-agent]: https://github.com/mikeal/tunnel-agent

  [request-core]: https://github.com/request/core
  [request-headers]: https://github.com/request/headers
  [request-digest]: https://github.com/request/digest
  [request-oauth]: https://github.com/request/oauth
  [request-multipart]: https://github.com/request/multipart
  [request-log]: https://github.com/request/log

  [redirect-option]: #redirect
