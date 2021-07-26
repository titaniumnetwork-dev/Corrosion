const webpack = require('webpack');
const createWebSocketProxy = require('./upgrade');
const createRequestProxy = require('./request');
const createGateway = require('./gateway');
const middleware = {
    ...require('./headers'),
    reconnectUrl: require('./reconnect-url'),
    decompress: require('./decompress'),
    rewriteBody: require('./rewrite-body'),
    ads: require('./ads'),
};
const defaultConfig = {
    prefix: '/service/',
    codec: 'plain',
    ws: true,
    cookie: true,
    title: 'Service',
    requestMiddleware: [],
    responseMiddleware: [],
    standardMiddleware: true,
};  

class Corrosion extends require('../rewrite') {
    constructor(config = defaultConfig) {
        super(Object.assign(defaultConfig, config));
        if (this.config.standardMiddleware) {
            this.config.requestMiddleware.unshift(
                middleware.requestHeaders,
                middleware.reconnectUrl
            );  
            this.config.responseMiddleware.unshift(
                middleware.responseHeaders,
                middleware.decompress,
                middleware.rewriteBody,
            );
        };
        this.gateway = createGateway(this);
        this.upgrade = createWebSocketProxy(this);
        this.request = createRequestProxy(this);
    }; 
    bundleScripts() {
        webpack({
            entry: './lib/browser/index.js',
            output: {
                path: __dirname,
                filename: '../../bundle.js',
            }
        }, err => 
            console.log(err || 'Bundled scripts')
        );
    };
};

Corrosion.middleware = middleware;
module.exports = Corrosion;