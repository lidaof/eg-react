'use strict';

const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Vision = require('vision');
const Good = require('@hapi/good');
const HapiSwagger = require('hapi-swagger');

/**
 * All routes to add to the server.  Each element of this array should be an object with a `registerRoutes` method,
 * which will receive the server object as its first parameter.
 * 
 * @see https://hapijs.com/tutorials/routing
 */
const ROUTES = [
    require('./routes/geneNameSearch'),
    require('./routes/geneLocusSearch'),
    require('./routes/public'),
    require('./routes/index'),
];

/**
 * Sets up a Hapi server, all configured and ready to go.  The only thing left to do is to start it.  For Hapi config
 * options, see https://hapijs.com/api#server.options
 * 
 * @param {MongoClient} mongoClient - MongoDB connection
 * @param {Object} options - Hapi server configuration object
 * @return {Promise<Server>} Hapi server
 */
async function setUpServer(mongoClient, options) {
    const server = Hapi.Server(options);

    const swaggerOptions = { // Swagger sets up a webpage with API documentation
        info: {
            title: 'WashU Epigenome Browser API Documentation',
        },
    };

    const goodOptions = { // Good sets up logging
        ops: {
            interval: 1000
        },
        reporters: {
            consoleReporter: [
                {
                    module: 'good-squeeze',
                    name: 'Squeeze',
                    args: [{ log: '*', response: '*' }]
                },
                {
                    module: 'good-console'
                },
                'stdout'
            ],
        }
    };

    await server.register([
        Inert,
        Vision,
        {
            plugin: HapiSwagger,
            options: swaggerOptions
        },
        {
            plugin: Good,
            options: goodOptions
        }
    ]);

    server.app.mongoClient = mongoClient;

    for (let route of ROUTES) {
        route.registerRoutes(server);
    }

    return server;
}

module.exports = {
    setUpServer: setUpServer
};
