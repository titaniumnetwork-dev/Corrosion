function createDocumentRewriter(ctx) {
    return function rewriteDocument() {
        if (ctx.serviceWorker) return;
        const {
            HTMLMediaElement,
            HTMLScriptElement, 
            HTMLAudioElement, 
            HTMLVideoElement, 
            HTMLInputElement, 
            HTMLEmbedElement, 
            HTMLTrackElement, 
            HTMLAnchorElement, 
            HTMLIFrameElement,
            HTMLAreaElement,
            HTMLLinkElement, 
            HTMLBaseElement,
            HTMLFormElement,
            HTMLImageElement, 
            HTMLSourceElement,
        } = ctx.window;
        const cookie = Object.getOwnPropertyDescriptor(ctx.window.Document.prototype, 'cookie');
        const domain = Object.getOwnPropertyDescriptor(ctx.window.Document.prototype, 'domain');
        const title = Object.getOwnPropertyDescriptor(ctx.window.Document.prototype, 'title');
        const cookieEnabled = Object.getOwnPropertyDescriptor(ctx.window.Navigator.prototype, 'cookieEnabled');
        let spoofTitle = '';

        if (ctx.window.Document.prototype.write) {
            ctx.window.Document.prototype.write = new Proxy(ctx.window.Document.prototype.write, {
                apply: (target, that , args) => {
                    if (args.length) args = [ ctx.html.process(args.join(''), ctx.meta) ];
                    return Reflect.apply(target, that, args);
                },
            });
        };
        if (ctx.window.Document.prototype.hasOwnProperty('cookie')) {
            Object.defineProperty(ctx.window.Document.prototype, 'cookie', {
                get: new Proxy(cookie.get, {
                    apply: (target, that, args) => {
                        const cookies = Reflect.apply(target, that, args);
                        return ctx.config.cookie ? ctx.cookies.decode(cookies, ctx.meta) : '';
                    },
                }),
                set: new Proxy(cookie.set, {
                    apply: (target, that, [ val ]) => {
                        return Reflect.apply(target, that, [ ctx.config.cookie ? ctx.cookies.encode(val, ctx.meta) : '' ]);
                    },
                }),
            });
        };
        if (ctx.window.Document.prototype.writeln) {
            ctx.window.Document.prototype.writeln = new Proxy(ctx.window.Document.prototype.writeln, {
                apply: (target, that , args) => {
                    if (args.length) args = [ ctx.html.process(args.join(''), ctx.meta) ];
                    return Reflect.apply(target, that, args);
                },
            });
        };
        if (ctx.window.Element.prototype.setAttribute) {
            ctx.window.Element.prototype.setAttribute = new Proxy(ctx.window.Element.prototype.setAttribute, {
                apply: (target, that, args) => {
                    if (args[0] && args[1]) {
                        const handler = ctx.html.attributeRoute({
                            name: args[0],
                            value: args[1],
                            node: that,
                        });
                        switch(handler) {
                            case 'url':
                                Reflect.apply(target, that, [`corrosion-${args[0]}`, args[1]]);
                                args[1] = ctx.url.wrap(args[1], ctx.meta);
                                break;
                            case 'srcset':
                                Reflect.apply(target, that, [`corrosion-${args[0]}`, args[1]]);
                                args[1] = ctx.html.srcset(args[1], ctx.meta);
                                break;
                            case 'css':
                                Reflect.apply(target, that, [`corrosion-${args[0]}`, args[1]]);
                                args[1] = ctx.css.process(args[1], { ...ctx.meta, context: 'declarationList' });
                                break;
                            case 'html':
                                Reflect.apply(target, that, [`corrosion-${args[0]}`, args[1]]);
                                args[1] = ctx.html.process(args[1], ctx.meta);
                                break;
                            case 'delete':
                                return Reflect.apply(target, that, [`corrosion-${args[0]}`, args[1]]);
                        };
                    };
                    return Reflect.apply(target, that, args);
                },
            });
        };
        if (ctx.window.Element.prototype.getAttribute) {
            ctx.window.Element.prototype.getAttribute = new Proxy(ctx.window.Element.prototype.getAttribute, {
                apply: (target, that, args) => {
                    if (args[0] && that.hasAttribute(`corrosion-${args[0]}`)) args[0] = `corrosion-${args[0]}`;
                    return Reflect.apply(target, that, args);
                },
            });
        }; 
        ctx.window.CSSStyleDeclaration.prototype.setProperty = new Proxy(ctx.window.CSSStyleDeclaration.prototype.setProperty, {
            apply: (target, that, args) => {
                if (args[1]) args[1] = ctx.css.process(args[1], { context: 'value', ...ctx.meta, });
                return Reflect.apply(target, that, args);
            },
        });
        if (ctx.window.Audio) {
            ctx.window.Audio = new Proxy(ctx.window.Audio, {
                construct: (target, args) => {
                    if (args[0]) args[0] = ctx.url.wrap(args[0], ctx.meta);
                    return Reflect.construct(target, args);
                },
            });
        };
        [
            'innerHTML',
            'outerHTML',
        ].forEach(html => {
            const descriptor = Object.getOwnPropertyDescriptor(ctx.window.Element.prototype, html);
            Object.defineProperty(ctx.window.Element.prototype, html, {
                get: new Proxy(descriptor.get, {
                    apply: (target, that, args) => {
                        const html = Reflect.apply(target, that, args);
                        return html == 'innerHTML' && that.tagName != 'SCRIPT' ? ctx.html.source(html, ctx.meta) : html;
                    },
                }),
                set: new Proxy(descriptor.set, {
                    apply(target, that, [ val ]) {
                        return Reflect.apply(target, that, [ ctx.html.process(val, ctx.meta) ]);
                    },
                }), 
            });
        });
        [
            ['background', 'background'],
            ['backgroundImage', 'background-image'],
            ['listStyleImage', 'list-style-image'],
        ].forEach(([key, cssProperty]) => {
            Object.defineProperty(ctx.window.CSS2Properties ? ctx.window.CSS2Properties.prototype : ctx.window.CSSStyleDeclaration.prototype, key, {
                get() {
                    return this.getPropertyValue(cssProperty);
                },
                set(val) {
                    return this.setProperty(cssProperty, val);
                },
            }); 
        });
        Object.defineProperty(ctx.window.Document.prototype, 'domain', {
            get: new Proxy(domain.get, {
                apply: () => ctx.location.hostname,
            }),
            set: domain.set,
        });
        Object.defineProperty(ctx.window.Document.prototype, 'title', {
            get: new Proxy(title.get, {
                apply: () => spoofTitle,
            }),
            set: new Proxy(title.set, {
                apply: (target, that, [ val ]) => spoofTitle = val, 
            }),
        });
        Object.defineProperty(ctx.window.Navigator.prototype, 'cookieEnabled', {
            get: new Proxy(cookieEnabled.get, {
                apply: () => ctx.config.cookie,
            }),
        });
        [
            {
                elements: [ HTMLScriptElement, HTMLMediaElement, HTMLImageElement, HTMLAudioElement, HTMLVideoElement, HTMLInputElement, HTMLEmbedElement, HTMLIFrameElement, HTMLTrackElement, HTMLSourceElement],
                properties: ['src'],
                handler: 'url',
            },
            {
                elements: [ HTMLFormElement ],
                properties: ['action'],
                handler: 'url',
            },
            {
                elements: [ HTMLAnchorElement, HTMLAreaElement, HTMLLinkElement, HTMLBaseElement ],
                properties: ['href'],
                handler: 'url',
            },
            {
                elements: [ HTMLImageElement, HTMLSourceElement ],
                properties: ['srcset'],
                handler: 'srcset',
            },  
            {
                elements: [ HTMLScriptElement ],
                properties: ['integrity'],
                handler: 'delete',
            },
            {
                elements: [ HTMLIFrameElement ],
                properties: ['contentWindow'],
                handler: 'window',  
            },
        ].forEach(entry => {
            entry.elements.forEach(element => {
                if (!element) return;
                entry.properties.forEach(property => {
                    if (!element.prototype.hasOwnProperty(property)) return;
                    const descriptor = Object.getOwnPropertyDescriptor(element.prototype, property);
                    Object.defineProperty(element.prototype, property, {
                        get: descriptor.get ? new Proxy(descriptor.get, {
                            apply: (target, that, args) => {
                                let val = Reflect.apply(target, that, args);
                                switch(entry.handler) {
                                    case 'url':
                                        val = ctx.url.unwrap(val, ctx.meta);
                                        break;
                                    case 'srcset':
                                        val = ctx.html.unsrcset(val, ctx.meta);
                                        break;
                                    case 'delete':
                                        val = that.getAttribute(`corrosion-${property}`);
                                        break;
                                    case 'window':
                                        try {
                                            if (!val.$corrosion)  {
                                                val.$corrosion = new ctx.constructor({ ...ctx.config, window: val, });
                                                val.$corrosion.init();
                                                val.$corrosion.meta = ctx.meta;
                                            };
                                        } catch(e) {
                                            //console.log(e);
                                        };
                                };
                                return val;
                            }, 
                        }) : undefined,
                        set: descriptor.set ? new Proxy(descriptor.set, {
                            apply(target, that, [ val ]) {
                                let newVal = val;
                                switch(entry.handler) {
                                    case 'url':
                                        newVal = ctx.url.wrap(newVal, ctx.meta);
                                        break;
                                    case 'srcset':
                                        newVal = ctx.html.srcset(newVal, ctx.meta);
                                        break;
                                    case 'delete':
                                        that.setAttribute(property, newVal);
                                        return newVal;
                                };
                                return Reflect.apply(target, that, [ newVal ]);
                            },
                        }) : undefined,
                    });
                });
            });
        });
    };
};
module.exports = createDocumentRewriter;