'use strict';
const fs = require('fs');

const mongoUtils = require('./mongoUtils');
const setUpServer = require('./server').setUpServer;

const ExitCodes = {
    UNKNOWN_ARGUMENT: 1,
    MONGO_ERROR: 2,
    SERVER_SETUP_ERROR: 3
};

/**
 * Main entry point.  Starts the server.
 * 
 * @param {string[]} argv - arguments
 */
async function main(argv) {
    if (argv.length < 3) {
        console.log(`Usage: node ${argv[1]} ["dev" or "prod"]`);
        process.exit(0);
    }

    // Get environment config
    const environment = argv[2].toLowerCase();
    let envConfig;
    if (environment === "dev") {
        const DEV_CONFIG = {
            dbUrl: 'mongodb://localhost:27017',
            host: 'localhost',
            port: 3001
        };
        envConfig = DEV_CONFIG;
    } else if (environment === "prod") {
        const tls = {
            key: fs.readFileSync('/etc/letsencrypt/live/epigenome.tk/privkey.pem'),
            cert: fs.readFileSync('/etc/letsencrypt/live/epigenome.tk/fullchain.pem')
          };
          const PROD_CONFIG = {
              dbUrl: 'mongodb://localhost:27017',
              host:'ec2-54-89-252-92.compute-1.amazonaws.com',
              port: 443,
              tls: tls
          };          
        envConfig = PROD_CONFIG
    } else if (environment === "api") {
        const tls = {
            key: fs.readFileSync('/etc/letsencrypt/live/api.epigenomegateway.org/privkey.pem'),
            cert: fs.readFileSync('/etc/letsencrypt/live/api.epigenomegateway.org/fullchain.pem')
          };
            const API_CONFIG = {
                dbUrl: 'mongodb://localhost:27017',
                host: 'ec2-35-174-168-189.compute-1.amazonaws.com',
                port: 443,
                tls: tls,
                routes: {
                    cors: {
                      origin: ['*'],
                      additionalHeaders: ['token']
                    }
                }
            };
        envConfig = API_CONFIG;
    } else {
        console.error(`Unknown environment "${environment}".  Enter either "dev" or "prod" or "api"`);
        process.exit(ExitCodes.UNKNOWN_ARGUMENT);
    }
    const {dbUrl, ...serverOptions} = envConfig;
    console.log(`Starting server in ${environment.toUpperCase()} mode...`);

    // Connect to MongoDB
    let mongoClient;
    try {
        mongoClient = await mongoUtils.getMongoClient(dbUrl);
        console.log(`Established MongoDB connection at ${dbUrl}`);
    } catch (error) {
        console.error(error.toString());
        console.error("Couldn't establish a MongoDB connection; aborting...");
        process.exit(ExitCodes.MONGO_ERROR);
    }

    // Start server
    let server;
    try {
        server = await setUpServer(mongoClient, serverOptions);
        await server.start();
        console.log(`Server running at ${server.info.uri}`);
    } catch (error) {
        console.error(error);
        console.error("There was a problem setting up the server; aborting...");
        process.exit(ExitCodes.SERVER_SETUP_ERROR);
    }

    // Set up callbacks after server has started
    process.on('SIGINT', async function() {
        console.log('Stopping server...');
        await server.stop();
        process.exit(0);
    });

    process.on('unhandledRejection', console.error);
}

if (require.main === module) { // Called directly
    main(process.argv)
} // else required as a module
