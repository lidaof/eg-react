'use strict';

const Hapi = require('hapi');
const server = new Hapi.Server();

server.connection({
    host: 'localhost',
    port: 3001
});

server.route({
    method: 'GET',
    path:'/hello',
    handler: function (request, reply) {
        return reply('hello world');
    }
});

server.route({
    method: 'POST',
    path:'/getTrackData',
    handler: function (request, reply) {
        return reply('wow very data');
    }
});


server.start((err) => {
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});
