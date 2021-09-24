function createCallExpression(callee, args) {
    return { type: 'CallExpression', callee, arguments: args, optional: false, };
};
function createArrayExpression(...elements) {
    return {
        type: 'ArrayExpression',
        elements,
    };
};
function createMemberExpression(object, property) {
    return {
        type: 'MemberExpression',
        object,
        property,
    };
};
function createLiteral(value) {
    return {
        type: 'Literal',
        value,
    }
};
function createIdentifier(name) {
    return { type: 'Identifier', name };
};

module.exports = { createCallExpression, createArrayExpression, createMemberExpression, createLiteral, createIdentifier, };