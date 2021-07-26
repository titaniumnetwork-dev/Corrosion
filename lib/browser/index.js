const createDocumentRewriter = require('./document');
const createHistoryRewriter = require('./history');
const createHttpRewriter = require('./http');
const createLocation = require('./location');
const createStorageRewriter = require('./storage');
const createWorkerRewriter = require('./worker');
const defaultConfig = {
    prefix: '/service/',
    codec: 'plain',
    ws: true,
    cookie: true,
    title: 'Service',
    serviceWorker: false,
    url: null,
    window: false,
};  

class Corrosion extends require('../rewrite') {
    constructor(config = defaultConfig) {
        super(Object.assign(defaultConfig, config));
        const corrosion = this;
        if (!this.config.window) throw 'Corrosion Error: No window was given.';
        this.serviceWorker = this.config.serviceWorker || false;
        this.window = this.config.window;
        this.document = this.serviceWorker ? this.window.document : {};
        this._url = new URL((this.config.url || this.url.unwrap(this.window.location.href, { origin: this.window.location.origin, })));
        this.originalXhr = this.window.XMLHttpRequest;
        this.meta = {
            origin: this.window.location.origin,
            get base() {
                if (corrosion.serviceWorker) return corrosion._url;
                return corrosion.window.document.baseURI != corrosion.location.href ? new URL(corrosion.window.document.baseURI) : corrosion._url;
            },
            url: this._url,
        };
        this.location = createLocation(this, this._url);
        this.rewriteHttp = createHttpRewriter(this);
        this.rewriteDocument = createDocumentRewriter(this);
        this.rewriteHistory = createHistoryRewriter(this);
        this.rewriteWorker = createWorkerRewriter(this);
        this.rewriteStorage = createStorageRewriter(this);
        if (!this.serviceWorker && this.window.document.currentScript) this.window.document.currentScript.remove();
    };
    get windowParent() {
        if (this.serviceWorker) return false;
        try {
            return this.window.parent.$corrosion ? this.window.parent : this.window;
        } catch(e) {
            return this.window;
        };
    };
    get windowTop() {
        if (this.serviceWorker) return false;
        try {
            return this.window.parent.$corrosion ? this.window.parent : this.window;
        } catch(e) {
            return this.window;
        };
    };
    init() {
        this.rewriteHttp();
        this.rewriteDocument();
        this.rewriteHistory();
        this.rewriteWorker();
        //this.rewriteStorage();
        this.window.Location = createLocation.Location;
        this.window.$corrosionGet = this.get.bind(this);
        this.window.$corrosionSet = this.set.bind(this);
        this.window.$corrosionCall = this.call.bind(this)
        this.window.$corrosionGetIdentifier = this.getIdentifier.bind(this);
        this.window.$corrosionSetIdentifier = this.setIdentifier.bind(this);
    };
    get(obj, key) {
        if (this.window != this.window.parent && obj == this.window.parent) {
            if (this.window.parent.$corrosion) return this.window.parent.$corrosionGet(obj, key);
            else obj = this.window;
        };
        if (this.window != this.window.top &&  obj == this.window.top) {
            if (this.window.top.$corrosion) return this.window.top.$corrosionGet(obj, key);
            else obj = this.window;
        };
        let ret = obj[key]; 
        if (!ret) return ret;
        if (obj == this.window && key == 'location' || obj == this.window.document && key == 'location') return this.location;
        if (key == Symbol.iterator || key == Symbol.toPrimitive) return ret.bind(obj);
        if (ret == Function.prototype.apply) return ret.bind(obj);
        return ret;
    };
    call(obj, key, args) {
        return obj[key](...args)
    };
    set(obj, key, val, operator) {
       /* if (obj == this.window || obj == this.window.document) {
            switch(key) {
                case 'location':
                    return this.location.href = val;
            };
        };*/
        if (this.window != this.window.parent && obj == this.window.parent) {
            if (this.window.parent.$corrosion) return this.window.parent.$corrosionSet(obj, key, val, operator);
            else obj = this.window;
        };
        if (this.window != this.window.top &&  obj == this.window.top) {
            if (this.window.top.$corrosion) return this.window.top.$corrosionSet(obj, key, val, operator);
            else obj = this.window;
        };
        if (obj == this.window || obj == this.document) {
            if (key == 'location') obj = this;
        };

        switch(operator) {
            case '+=':
                return obj[key] += val;
            case '-=':
                return obj[key] -= val;
            case '*=':
                return obj[key] *= val;
            case '/=':
                return obj[key] /= val;
            case '%=':
                return obj[key] %= val;
            case '**=':
                return obj[key] **= val;
            case '<<=':
                return obj[key] <<= val;
            case '>>=':
                return obj[key] >>= val;
            case '>>>=':
                return obj[key] >>>= val;
            case '&=':
                return obj[key] &= val;
            case '^=':
                return obj[key] ^= val;
            case '|=':
                return obj[key] |= val;
            case '&&=':
                return obj[key] &&= val;
            case '||=':
                return obj[key] ||= val;
            case '??=':
                return obj[key] ??= val;
            case '++':
                return obj[key]++;
            case '--':
                return obj[key]--;
            case '=':
            default:
                return obj[key] = val;
        };
    };
    setIdentifier(identifier, val) {
        if (identifier == this.window.location) return this.location.href = val;
        return identifier = val;
    };
    getIdentifier(identifier) {
        if (identifier == this.window.location) return this.location;
        return identifier;
    };
    updateLocation() {
        this._url = new URL(this.url.unwrap(this.window.location.href, this.meta));
        this.location = createLocation(this, this._url);
    }; 
};

globalThis.Corrosion = Corrosion;