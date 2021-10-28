function address(arr = []) {
    return function (ctx) {
        ctx.address = arr[Math.floor(Math.random() * arr.length)];
    };
};

function blacklist(arr = [], page = '') {
    return function (ctx) {
        if (arr.includes(ctx.url.hostname)) ctx.clientResponse.end(page);
    };
};

function force(url = 'https://example.com') {
    return url.replace(/^http:\/\//, 'https://');
}

exports.address = address;
exports.blacklist = blacklist;
exports.force = force;
