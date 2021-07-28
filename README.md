# Corrosion
Titanium Network's web proxy.

Project is still in development! Pull requests that contribute a lot will be accepted :)

Notable websites that work
- Youtube
- Twitch
- Instagram
- Discord
- Disney Plus
- Tik Tok
- Reddit


# Installation:
```
npm i corrosion
```

# Example:
```javascript
const Corrosion = require('corrosion');
const proxy = new Corrosion();
const http = require('http')
http.createServer((req, res) => proxy.request(req, res)).on('upgrade', proxy.upgrade).listen(80);
```
Much more in depth one is in the [demo folder](demo/).

# API:
  
  
## Index
-  `config`
   - `prefix` String - URL Prefix
   - `title` (Boolean / String) - Title used for HTML documents
   - `ws` Boolean - WebSocket rewriting
   - `cookie` Boolean - Request Cookies
   - `codec` String - URL encoding (base64, plain, xor).
   - `requestMiddleware` Array - Array of middleware functions for proxy request (Server). 
   - `responseMiddleware` Array - Array of middleware functions for proxy response (Server).
   - `standardMiddleware` Boolean - Use the prebuilt middleware used by default (Server). 

- Properties
  - [url](#url)
  - [html](#html)
  - [js](#js)
  - [css](#css)
  - [cookies](#cookies)
  - [config](#index)
  - [prefix](#url#properties)

## url 

#### wrap
  - `val` String
  - `config` Configuration
    - `base` WHATWG URL
    - `origin` Location origin - Adds a location origin before the proxy url
    - `flags` Array - ['xhr'] => /service/xhr_/https%3A%2F%2Fexample.org/

#### unwrap
  - `val` String
  - `config` Configuration
    - `origin` Location origin - Required if a location origin starts before the proxy url
    - `flags` Boolean - Returns with both the URL and flags found { value: 'https://example.org', flags: ['xhr'], })
    - `leftovers` Boolean - Use any leftovers if any after the encoded proxy url


## Properties
  - `regex` Regex used to determine to rewrite the URL or not.

  - `prefix` URL Prefix

  - `codec` (base64, plain, xor)


## js

### Methods:

#### process
  - `source` JS script
  - `url` URL for heading

#### iterate
  - `ast` JS AST
  - `Callback` Handler initated on AST node

#### createHead
  - `url` URL for heading

#### createCallExperssion 
  - `callee` Acorn.js Node
  - `args` Array

#### createArrayExpression
  - `elements` Array

#### createIdentifier
  - `name` Identifier name
  - `preventRewrite` Prevent further rewrites

#### createLiteral
  - `value` Literal value

## css

### Methods:

#### process
  - `source` CSS
  - `config` Configuration
    - `base` WHATWG URL
    - `origin` Location origin
    - `context` CSS-Tree context

## html

### Methods:

#### process
  - `source` HTML Source 
  - `config` Configuration
    - `document` Determines of its a document or fragment for parsing
    - `base` WHATWG URL
    - `origin` Location origin

#### source
  - `processed` Rewritten HTML
  - `config` Configuration
    - `document` Determines of its a document or fragment for parsing

### Properties
- `map` Map for attribute rewriting


## cookies

### Methods:

#### encode
  - `input` New (Cookie / Cookies)
  - `config` Configuration
    - `url` WHATWG URL
    - `domain` Cookie Domain
    - `secure` Cookie Secure

#### decode
  - `store` Encoded Cookies
  - `config` Configuration
    - `url` WHATWG URL

## codec

### Methods:

#### encode
#### decode
  - `str` String
