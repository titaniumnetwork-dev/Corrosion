const https = require('https');
const fs = require('fs');
const ssl = {
    key: fs.readFileSync('./ssl.key'),
    cert: fs.readFileSync('./ssl.cert'),
};
const server = https.createServer(ssl);
const Corrosion = require('../');
const proxy = new Corrosion({
    codec: 'base64',
});

// Builds client injection script.
proxy.bundleScripts();

server.on('request', (request, response) => {
    if (request.url.startsWith(proxy.prefix)) return proxy.request(request, response);
    response.end(fs.readFileSync(__dirname + '/index.html', 'utf-8'));
}).on('upgrade', proxy.upgrade).listen(443); 