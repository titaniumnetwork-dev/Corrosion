const list = [
    'doubleclick.net'
];
module.exports = function AdBlocker(ctx) {
    if (list.includes(ctx.url.hostname)) return ctx.clientResponse.end();
    return true;
};