function createStorageRewriter(ctx) {
    return function rewriteStorage() {
        if (ctx.window.Storage) {
            [
                'getItem',
                'setItem',
                'removeItem',
            ].forEach(method => 
                ctx.window.Storage.prototype[method] = new Proxy(ctx.window.Storage.prototype[method], {
                    apply: (target, that, args) => {
                        if (args[0]) args[0] += '@' + ctx.location.origin;
                        return Reflect.apply(target, that, args)
                    },
                }),
            );
        }; 
    };
};
module.exports = createStorageRewriter;