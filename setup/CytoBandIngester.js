'use strict';

const fs = require('fs');
const mongoUtils = require('../mongoUtils.js');
const yesno = require('yesno');

function promiseReadFile(fileName, encoding) {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, encoding, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    });
}

function promiseReadDir(path, options) {
    return new Promise((resolve, reject) => {
        fs.readdir(path, options, (err, files) => {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });
}

function promiseAsk(question, defaultValue) {
    return new Promise((resolve, reject) => {
        yesno.ask(question, defaultValue, (answer) => {
            process.stdin.end(); // yesno fails to close stdin, so we do it here.
            resolve(answer);
        });
    });
}

class RefGeneIngester {
    constructor(parser, database) {
        this.parser = parser;
        this.database = database;
    }

    ingestDir(dirPath, askConfirm) {
        let fileNames = null;
        return promiseReadDir(dirPath)
            .then((_fileNames) => {
                fileNames = _fileNames;
                return askConfirm ? this.askReplaceDatabase(fileNames) : true;
            })
            .then((userSaidYes) => {
                if (!userSaidYes) {
                    console.log("Aborting.");
                    return;
                }

                let promises = [];
                for (let fileName of fileNames) {
                    let path = dirPath + '/' + fileName
                    let promise = this.ingestFile(path, fileName)
                        .then(() => {
                            console.log("Set up collection " + fileName);
                        })
                        .catch((error) => {
                            console.error(`Failed to put ${fileName} in database`);
                            console.error(error);
                        });
                    promises.push(promise);
                }
                return Promise.all(promises);
            });
    }

    askReplaceDatabase(fileNames) {
        return promiseAsk(
            `This will drop and recreate the following collections in the '${this.database.databaseName}' database:\n` +
            "    " + fileNames.join('\n    ') + "\n" +
            "Continue (y/n)?",
            false
        );
    }

    ingestFile(filePath, collectionName) {
        let records = null;
        let collection = null;
        return promiseReadFile(filePath, 'utf8')
            .then(fileContents => this.parser.parse(fileContents))
            .catch((error) => {
                console.error(`Failed to parse ${filePath} -- collection unmodified.`);
                throw error;
            })
            .then((recs) => {
                records = recs; // Save to local var
                console.log("Successfully parsed " + filePath);
            })
            .then(() => this.recreateCollection(collectionName))
            .then(col => collection = col) // Save to local var
            .then(() => collection.insertMany(records))
            .then(() => collection.createIndex({start: 1, end: -1, chromosome: 1}));
    }

    recreateCollection(name) {
        return mongoUtils.findCollection(this.database, name)
            .then((result) => {
                if (result) {
                    return this.database.dropCollection(name);
                }
            })
            .then(() => this.database.collection(name));
    }
}

module.exports = RefGeneIngester;
