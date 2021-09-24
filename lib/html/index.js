// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------
const parse5 = require('parse5');
const rawAttrs = require('./attributes');
const { iterate } = require('./parse5');

class HTMLRewriter {
    constructor(ctx) {
        const master = this;
        this.ctx = ctx;
        this.attrs = new Map();
        rawAttrs.forEach(({ tag, attribute, run }) => {
            if (Array.isArray(tag)) {
                for (const entry of tag) processAttribute(entry, attribute, run);
            } else {
                processAttribute(tag, attribute, run);
            };
        });
        function processAttribute(tag, attribute, run) {
            if (!master.attrs.has(tag)) master.attrs.set(tag, {});
            if (Array.isArray(attribute)) {
                for (const entry of attribute) master.attrs.get(tag)[entry] = run;
            } else {
                master.attrs.get(tag)[attribute] = run;
            };
        };
    };
    process(source, config = {}) {
        const ast = parse5[config.document ? 'parse' : 'parseFragment'](source);
        iterate(ast, node => {
            if (!node.tagName) return false;
            if (!!node.textContent) {
                switch(node.nodeName) {
                    case 'title':
                        if (this.ctx.config.title) {
                            node.setAttribute('corrosion-text', node.textContent);
                            node.textContent = this.ctx.config.title;
                        };
                        break;
                    case 'noscript':
                        node.textContent = this.process(node.textContent, { meta: config.meta || {}, });
                        break;
                
                };
            };
            for (const attr of node.attrs) {
                let data = {
                    ctx: this.ctx,
                    attr,
                    node,
                    meta: config.meta,
                    delete: false,
                };
                if (this.attrs.get('*')[attr.name]) this.attrs.get('*')[attr.name](node, data);
                if (this.attrs.has(node.nodeName) && this.attrs.get(node.nodeName)[attr.name]) this.attrs.get(node.nodeName)[attr.name](node, data);
            };
        });
        return parse5.serialize(ast);
    };
    srcset(val, meta = {}) {
        return val.split(',').map(src => {
            const parts = src.trimStart().split(' ');
            if (parts[0]) parts[0] = this.ctx.url.wrap(parts[0], meta);
            return parts.join(' ');
        }).join(', ');
    };
    unsrcset(val, meta = {}) {
        return val.split(',').map(src => {
            const parts = src.trimStart().split(' ');
            if (parts[0]) parts[0] = this.ctx.url.unwrap(parts[0], meta);
            return parts.join(' ');
        }).join(', ');
    };
}

module.exports = HTMLRewriter;