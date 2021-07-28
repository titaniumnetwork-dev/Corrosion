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
Much more in depth one is in the `demo` folder.

# API:
  
  
# Index
-  `config`
   - `config.prefix` (String) URL Prefix
   - `config.title` (Boolean / String) Title used for HTML documents
   - `config.ws` (Boolean) WebSocket rewriting
   - `config.cookie` (Boolean) Request Cookies
   - `config.codec` (String) URL encoding (base64, plain, xor).
   - `config.requestMiddleware` (Array) Array of middleware functions for proxy request. 
   - `config.responseMiddleware` (Array) Array of middleware functions for proxy response.
   - `config.standardMiddleware` (Boolean) Use the prebuilt middleware used by default. 

# JS Rewriter

## Methods:

### process
  - `source` JS script
  - `url` URL for heading

### iterate
  - `ast` JS AST
  - `Callback` Handler initated on AST node

### createHead
  - `url` URL for heading

### createCallExperssion 
  - `callee` Acorn.js Node
  - `args` Array

### createArrayExpression
  - `elements` Array

### createIdentifier
  - `name` Identifier name
  - `preventRewrite` Prevent further rewrites

### createLiteral
  - `value` Literal value

# CSS Rewriter

## Methods:

### process:
  - `source` CSS
  - `config` Configuration
    - `base` WHATWG URL
    - `origin` Location origin
    - `context` CSS-Tree context

# HTML Rewriter 

## Methods:

### process:
  - `source` HTML Source 
  - `config` Configuration
    - `document` Determines of its a document or fragment for parsing
    - `base` WHATWG URL
    - `origin` Location origin

### source:
  - `processed` Rewritten HTML
  - `config` Configuration
    - `document` Determines of its a document or fragment for parsing

## Properties
- `map` Map for attribute rewriting


# Cookie Rewriter 

## Methods:

### encode:
  - `input` New (Cookie / Cookies)
  - `config` Configuration
    - `url` WHATWG URL
    - `domain` Cookie Domain
    - `secure` Cookie Secure

### decode:
  - `store` Encoded Cookies
  - `config` Configuration
    - `url` WHATWG URL
