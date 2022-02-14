"use strict";

const fs = require("fs");
// const child_process = require('child_process');
const yesno = require("yesno");
//const ALL_IMPORTERS = require('./mongoImporters');
const MongoImporter = require("./mongoImporters");
const mongoUtils = require("../mongoUtils");
const genomeConfig = require("./genomeConfig");

const MONGO_URL = "mongodb://localhost:27017";
const DATA_DIR = "genomeData";
const ExitCodes = {
    DATA_DIR_MISSING_ERROR: 1,
    MONGO_CONNECT_ERROR: 2,
    IMPORT_ERROR: 3,
};

/**
 * Asks a boolean question to the user on stdin.
 *
 * @param {string} question - question to ask
 * @param {boolean} defaultValue - default value for blank response
 * @return {Promise<boolean>} whether the user said yes
 */
function askUser(question, defaultValue) {
    return new Promise((resolve, reject) => {
        yesno.ask(question, defaultValue, (answer) => {
            process.stdin.end(); // yesno fails to close stdin, so we do it here.
            resolve(answer);
        });
    });
}

/**
 * Main entry point.  Modifies a MongoDB database for each directory in DATA_DIR.
 * Notes:
 *  - Ignores directories starting with a "."
 *  - Calls the methods of each object in `ALL_IMPORTERS`.
 *
 * @return {Promise<number>} exit code
 */
async function main() {
    // Get directories to import
    // let genomes;
    // try {
    //     genomes = fs.readdirSync(DATA_DIR).filter(dir => !dir.startsWith('.'));
    // } catch (error) {
    //     console.error(error.toString());
    //     console.error('Could not open data directory; aborting...');
    //     return ExitCodes.DATA_DIR_MISSING_ERROR;
    // }

    // const genomes = ["hpv16"]; // if just want to load one genome
    // const genomes = ["TbruceiTREU927", "TbruceiLister427"]; // if just want to load one genome
    // const genomes = ["xenTro10"]; // if just want to load one genome
    // const genomes = ["b_chiifu_v3"]; // if just want to load one genome
    // const genomes = ["susScr11", "oviAri4"]; // if just want to load one genome
    // const genomes = ["susScr3"]; // if just want to load one genome
    const genomes = ["rheMac10", "calJac4"]; // if just want to load one genome

    // Get mongo connection
    let mongoClient;
    try {
        mongoClient = await mongoUtils.getMongoClient(MONGO_URL);
    } catch (error) {
        console.error(error.toString());
        console.error("Couldn't establish a MongoDB connection; aborting...");
        return ExitCodes.MONGO_CONNECT_ERROR;
    }

    // Get permission
    const permission = await askUser(
        "This will modify the following databases in MongoDB:\n" +
            `    ${genomes.join("\n    ")}\n` +
            "Continue (y/n)?",
        false
    );
    if (!permission) {
        console.log("Aborting.");
        return 0;
    }

    for (let genome of genomes) {
        try {
            console.log(`Loading genome ${genome}`);
            const db = mongoClient.db(genome);
            for (let config of genomeConfig[genome]) {
                const importer = new MongoImporter(
                    DATA_DIR,
                    genome,
                    db,
                    config.name,
                    config.file,
                    config.fieldsConfig.fields,
                    config.fieldsConfig.indexFields
                );
                await importer.importAndIndex();
            }
        } catch (error) {
            console.error(error.toString());
            console.error(`Error during data import for ${genome}.  Aborting...`);
            return ExitCodes.IMPORT_ERROR;
        }

        console.log(`${genome}: done`);
        console.log();
    }

    console.log("All done");
    return 0;
}

if (require.main === module) {
    // Called directly
    main().then(process.exit);
} // else required as a module
