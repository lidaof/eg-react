'use strict';

const child_process = require('child_process');
const fs = require('fs');

const isWin = process.platform === 'win32';
const MONGO_IMPORT = isWin ? '"c:\\Program Files\\MongoDB\\Server\\3.6\\bin\\mongoimport.exe"' : 'mongoimport';

/**
 * An importer of data for MongoDB
 */
class MongoImporter {
    /**
     * Imports data into MongoDB.  The method will receive the data directory, database name to use, and a database
     * object from MongoDB.
     *
     * @param {string} dataDir - data directory
     * @param {string} genomeName - database name to use
     * @param {Database} database - database object from MongoDB
     * @param {string} name - collection name
     * @param {string} fields - comma separated headers/column names
     * @param {object[]} indexFields - list of object for index purpose
     * @return {Promise<void>} promise that resolves when importing is done
     */
    constructor(dataDir, genomeName, database, name, file, fields, indexFields) {
        this.dataDir = dataDir;
        this.genomeName = genomeName;
        this.database = database;
        this.name = name;
        this.fields = fields;
        this.indexFields = indexFields
        this.sourceFile = `${dataDir}/${genomeName}/${file}`;
    }

    async importAndIndex() {
        if (fs.existsSync(this.sourceFile)) {
            child_process.execSync(
                `${MONGO_IMPORT} -d ${this.genomeName} -c ${this.name} --drop ` +
                    `--file ${this.sourceFile} --type tsv ` +
                    `-f ${this.fields} ` +
                    '--numInsertionWorkers 4'
            );
            const collection = this.database.collection(this.name);
            for (const index of this.indexFields) {
                await collection.createIndex(index);
            }
        } else {
            console.error(`Error: file ${this.sourceFile} not exists!!`);
        }
    }
}

module.exports = MongoImporter;
