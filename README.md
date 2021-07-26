# Corrosion
Titanium Network's web proxy.

Project is still in development! Pull requests that contribute a lot will be accepted :)

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
