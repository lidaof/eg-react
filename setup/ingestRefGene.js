'use strict';

const mongoUtils = require('../mongoUtils.js');
const RefGeneIngester = require('./RefGeneIngester.js');
const RefGeneParser = require('./RefGeneParser.js').RefGeneParser;

function main(dirPath) {
    let database = null;
    return mongoUtils.getRefGeneDatabase()
        .then((db) => {
            database = db;
            let ingester = new RefGeneIngester(new RefGeneParser(), database);
            return ingester.ingestDir(dirPath, true);
        })
        .catch(console.error)
        .then(() => {
            if (database !== null) {
                return database.close();
            }
        });
}

if (require.main === module) {
    if (process.argv[2] === undefined) {
        console.log(`Usage: ${process.argv[1]} <directory to ingest>`);
    } else {
        main(process.argv[2]);
    }
}
