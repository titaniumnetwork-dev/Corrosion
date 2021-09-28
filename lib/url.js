// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------
const codec = require('./codec');
const defaultConfig = {
    prefix: '/service/',
    codec: 'plain'
};

class URLWrapper {
    constructor(config = defaultConfig) {
        this.prefix = config.prefix || defaultConfig.prefix;
        this.codec = codec[config.codec || 'plain'] || codec['plain'];
        this.regex = /^(#|about:|data:|blob:|mailto:)/;
        this.javascript = /^javascript:/;
        this.protocols = ['http:', 'https:', 'ws:', 'wss:'];
    };
    wrap(val, config = {}) {
        if (!val && val != null || this.regex.test(val) || !config.base) return val;
        if (this.javascript.test(val)) return val;
        const url = new URL(val, config.base);
        if (!this.protocols.includes(url.protocol)) return val;
        return (config.origin || '') + this.prefix.slice(0, -1) + [ '', ...(config.flags || []) ].join('/_') + '/' + this.codec.encode(url.href);
    };
    unwrap(val, config = {}) {
        if (!val && val != null || this.regex.test(val) || this.javascript.test(val)) return val;
        const flags = (val.match(/\/_(.*)\//) || [ null, ''])[1].split('/_');
        const url = this.codec.decode(val.slice(((config.origin || '') + this.prefix + (flags[0] ? '_' + flags.join('/_') + '/' : '')).length));
        return config.flags ? { flags, value: url } : url;
    };
}

module.exports = URLWrapper;
