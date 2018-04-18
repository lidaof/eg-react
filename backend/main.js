'use strict';

const mongoUtils = require('./mongoUtils');
const setUpServer = require('./server').setUpServer;

const DEF_CONFIG = {
    dbUrl: 'mongodb://localhost:27017',
    host: 'localhost',
    port: 3001
};
const PROD_CONFIG = {
    dbUrl: 'mongodb://localhost:27017',
    port: 3001
};
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
    let envConfig = DEF_CONFIG;
    if (environment === "dev") {
        envConfig = DEF_CONFIG;
    } else if (environment === "prod") {
        envConfig = PROD_CONFIG
    } else {
        console.error(`Unknown environment "${environment}".  Enter either "dev" or "prod"`);
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
        console.error(error);
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
