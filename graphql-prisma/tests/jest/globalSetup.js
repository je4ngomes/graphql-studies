require('@babel/register');
require('@babel/polyfill/noConflict');
const formatError = require('apollo-errors').formatError;
const server = require('../../src/server').default;

module.exports = async () => {
   global.httpServer = await server.start({ port: 3005, formatError });
};