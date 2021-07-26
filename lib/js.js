const { parse } = require('acorn-hammerhead');
const { generate } = require('./esotope');

class JSRewriter {
    constructor(ctx) {
        this.parseOptions = { 
            allowReturnOutsideFunction: true, 
            allowImportExportEverywhere: true, 
            ecmaVersion: 2021, 
        };
        this.generationOptions = {
            format: {
                quotes: 'double',
                escapeless: true,
                compact: true,
            },
        };
        this.rewrite = ['location'];
        this.map = [
            {
                type: 'MemberExpression',
                handler: this.processMemberExpression.bind(this),
            },
            {
                type: 'Identifier',
                handler: this.processIdentifier.bind(this),
            },
        ];
        this.ctx = ctx;
    };
    process(source, url) {
        try {
            const ast = parse(source, this.parseOptions);
            this.iterate(ast, (node, parent) => {
                const fn = this.map.find(entry => entry.type == (node || {}).type);
                if (fn) fn.handler(node, parent);
            });
            return (url ? this.createHead(url) : '') + generate(ast, this.generationOptions);
        } catch(e) {
            return source;
        };
    };
    createHead(url) {
        return `
        if (!self.$corrosion && self.importScripts) {
            importScripts(location.origin + '${this.ctx.prefix}index.js');
            self.$corrosion = new Corrosion({ url: '${url}', codec: '${this.ctx.config.codec || 'plain'}', serviceWorker: true,  window: self, prefix: '${this.ctx.prefix || '/service/'}', ws: ${this.ctx.config.ws || true}, cookies: ${this.ctx.config.cookies || false}, title: '${this.ctx.config.title}', }); $corrosion.init();
        };\n`;
    };
    iterate(ast, handler) {
        if (typeof ast != 'object' || !handler) return;
        walk(ast, null, handler);
        function walk(node, parent, handler) {
            if (typeof node != 'object' || !handler) return;
            handler(node, parent, handler);
            for (const child in node) {
                if (Array.isArray(node[child])) {
                    node[child].forEach(entry => walk(entry, node, handler));
                } else {
                    walk(node[child], node, handler);
                };
            };
        };
    };
    processIdentifier(node, parent) {
        if (parent.type == 'MemberExpression' && parent.property == node) return; // window.location;
        if (parent.type == 'LabeledStatement') return; // { location: null, };
        if (parent.type == 'VariableDeclarator') return;
        if (parent.type == 'Property' && parent.key == node) return;
        if (parent.type == 'MethodDefinition') return;
        if (parent.type == 'ClassDeclaration') return;
        if (parent.type == 'RestElement') return;
        if (parent.type == 'ExportSpecifier') return;
        if (parent.type == 'ImportSpecifier') return;
        if (parent.type == 'FunctionDeclaration' && parent.params.includes(node)) return;
        if (node.name != 'location') return;
        if (node.preventRewrite) return;
        let identifier = '$corrosionGetIdentifier';
        let nodeToRewrite = node;
        const args = [
            this.createIdentifier(node.name, true),
        ];

        if (parent.type == 'AssignmentExpression' && parent.left == node) {
            identifier = '$corrosionSetIdentifier';
            nodeToRewrite = parent;
            args.push(parent.right);
        };

        Object.assign(nodeToRewrite, this.createCallExpression({ type: 'Identifier', name: identifier }, args));
    };
    processMemberExpression(node, parent) {
        let rewrite = false;
        if (node.preventRewrite) return;
        switch(node.property.type) {
            case 'Identifier':
                //if (node.computed) rewrite = true;
                if (node.property.name == 'location') {
                    node.property = this.createLiteral(node.property.name);
                    rewrite = true;
                };
                break;
            case 'Literal':
                if (node.property.value == 'location') rewrite = true;
                break;
            case 'TemplateLiteral':
                rewrite = true;
                break;
        };
        if (rewrite) {
            let identifier = '$corrosionGet';
            let nodeToRewrite = node;
            const args = [
                node.object,
                node.property,
            ];
            if (parent.type == 'AssignmentExpression' && parent.left == node) {
                identifier = '$corrosionSet';
                nodeToRewrite = parent;
                args.push(parent.right, this.createLiteral(parent.operator));
            };
            if (parent.type == 'CallExpression' && parent.callee == node) {
                identifier = '$corrosionCall';
                nodeToRewrite = parent;
                args.push(this.createArrayExpression(...parent.arguments))
            };
            if (parent.type == 'UpdateExpression') {
                identifier = '$corrosionSet';
                nodeToRewrite = parent;
                args.push(this.createLiteral(null), this.createLiteral(parent.operator));
            };
            Object.assign(nodeToRewrite, this.createCallExpression({ type: 'Identifier', name: identifier, }, args));
        };
    };
    createCallExpression(callee, args) {
        return { type: 'CallExpression', callee, arguments: args, optional: false, };
    };
    createArrayExpression(...elements) {
        return {
            type: 'ArrayExpression',
            elements,
        };
    };
    createSequenceExpression(...expressions) {
        return {
            type: 'SequenceExpression',
            expressions,
        };
    };
    createLiteral(value) {
        return {
            type: 'Literal',
            value,
        }
    };
    createIdentifier(name, preventRewrite) {
        return { type: 'Identifier', name, preventRewrite: preventRewrite || false,  };
    };
};

module.exports = JSRewriter;