'use strict';

const Boom = require('boom');
const mongoUtils = require('../mongoUtils.js');

class RefGeneSource {
    constructor(database) {
        this.database = database;
    }

    query(collectionName, chromosome, startBase, endBase) {
        let promise = mongoUtils.findCollection(this.database, collectionName)
            .then((result) => {
                if (!result) {
                    throw Boom.notFound("No such genome: " + collectionName);
                }

                let collection = this.database.collection(collectionName);
                return collection.find({
                    chromosome: chromosome,
                    start: { $gt: startBase },
                    end: { $lt: endBase },
                }).toArray();
            });
        return promise;
    }
}

module.exports = RefGeneSource;
