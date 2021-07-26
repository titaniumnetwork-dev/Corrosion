class WindowProxy {
    constructor(ctx) {
        this.win = new Proxy(ctx.window, {
            get: (target, prop) => {
                switch(prop) {
                    case 'parent':
                    case 'top':
                        try {
                            return ctx.window[prop]['$corrosionWindow'] || this.win;
                        } catch(e) {
                            return this.win;
                        };
                    case 'location':
                        return ctx.location;
                    case 'window':
                    case 'self':
                        return this.win;
                    default:
                        return get(target, prop);
                };
            },
            set: (target, prop, val) => {
                if (prop == 'location') return Reflect.set(ctx.location, 'href', val);
                return Reflect.set(target, prop, val)
            },
        });
        this.doc = new Proxy(ctx.window.document, {
            get: (target, prop) => {
                switch(prop) {
                    case 'location':
                        return ctx.location;
                    case 'defaultView':
                        return this.win;
                    default:
                        return get(target, prop);
                };
            },
            set: (target, prop, val) => {
                if (prop == 'location') return Reflect.set(ctx.location, 'href', val);
                return Reflect.set(target, prop, val)
            },
        });
        this.get = get;
        /*[
            [ctx.window.Node.prototype, 'contains'],
            [ctx.window.Node.prototype, 'compareDocumentPosition'],
            [ctx.window.Node.prototype, 'insertBefore'],
            [ctx.window.Document.prototype, 'createTreeWalker'],
            [ctx.window.MutationObserver.prototype, 'observe'],
            [ctx.window.Function.prototype, 'apply'],
            [ctx.window.Function.prototype, 'bind'],
            [ctx.window.Function.prototype, 'call'],
        ].forEach(([ target, prop ]) => {
            target[prop] = new Proxy(target[prop], {
                apply(target, that, args) {
                    args.forEach((arg, i) => {
                        switch(arg) {
                            case this.win:
                                args[i] = ctx.window;
                                break;
                            case this.doc:
                                args[i] = ctx.window.document;
                                break;
                        };
                    });
                    switch(args[0]) {
                        case this.win:
                            args[0] = ctx.window;
                            break;
                        case this.doc:
                            args[0] = ctx.window.document;
                            break;
                    };
                    return Reflect.apply(target, that, args);
                },
            });
        });*/
        /*ctx.window.Function.prototype.apply = new Proxy(ctx.window.Function.prototype.apply, {
            apply: (target, that, args) => {
                for (let i in args) {
                    if (args[i] == this.win) args[i] = ctx.window;
                    if (args[i] == this.doc) args[i] = ctx.window.document;
                };
                return Reflect.apply(target, that, args);
            },
        });
        ctx.window.Function.prototype.bind = new Proxy(ctx.window.Function.prototype.bind, {
            apply: (target, that, args) => {
                for (let i in args) {
                    if (args[i] == this.win) args[i] = ctx.window;
                    if (args[i] == this.doc) args[i] = ctx.window.document;
                };
                return Reflect.apply(target, that, args);
            },
        });
        ctx.window.Function.prototype.call = new Proxy(ctx.window.Function.prototype.call, {
            apply: (target, that, args) => {
                for (let i in args) {
                    if (args[i] == this.win) args[i] = ctx.window;
                    if (args[i] == this.doc) args[i] = ctx.window.document;
                };
                return Reflect.apply(target, that, args);
            },
        });*/
    };
};

function get(obj, prop){
    var ret = Reflect.get(obj, prop);
    if (typeof ret == 'function') return new Proxy(ret, {
        apply(target, that, args){
            return Reflect.apply(Object.defineProperties(target.bind(obj), Object.getOwnPropertyDescriptors(target)), that, args);
        },
        get(target, prop){
            return Reflect.get(ret, prop);
        },
        set(target, prop, val){
            return Reflect.set(ret, prop, val);
        },
        getOwnPropertyDescriptor(target, prop){
            return Reflect.getOwnPropertyDescriptor(ret, prop);
        },  
        defineProperty(target, prop, attrs){
            return Reflect.defineProperty(ret, prop, attrs);
        },
        has(target, prop){
            return Reflect.has(ret, prop);
        },
    });
    return ret;
};

module.exports = WindowProxy;