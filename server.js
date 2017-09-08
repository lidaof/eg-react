'use strict';

const Hapi = require('hapi');
const configRefGeneRoute = require('./routes/refGeneRoute.js');

var server = null;

function startServer(dataSources, logger) {
    server = new Hapi.Server();

    server.connection({
        host: 'localhost',
        port: 3001
    });

    configRefGeneRoute(server, dataSources.refGeneSource);

    return server.start().then(() => {
        console.log('Server running at:', server.info.uri);
    });
}

function stopServer() {
    if (server === null) {
        return Promise.reject(new Error("No server running"));
    }
    return server.stop().then(() => server = null);
}

module.exports = {
    start: startServer,
    stop: stopServer,
};
