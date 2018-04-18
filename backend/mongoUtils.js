'use strict';

const MongoClient = require('mongodb').MongoClient;

/**
 * Establishes connection to MongoDB.  Remember to handle promise rejections!
 * 
 * @param {string} url - url of running MongoDB
 * @return {Promise<MongoClient>} MongoDB client
 */
async function getMongoClient(url) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, (error, client) => {
            if (error) {
                reject(error);
            } else {
                resolve(client);
            }
        });
    });
}

/**
 * Executes a find in a collection with the specified MongoClient.
 * 
 * @param {MongoClient} mongoClient - database connection
 * @param {string} genomeName - genome name to query
 * @param {string} collectionName - collection name to query
 * @param {Object} query - Mongo query selection filter
 * @param {Object} options - find options
 * @return {Cursor} Cursor that iterates through results
 * @see https://docs.mongodb.com/manual/reference/method/db.collection.find/
 * @see http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#find
 */
function executeFind(mongoClient, genomeName, collectionName, query, options) {
    const db = mongoClient.db(genomeName);
    const collection = db.collection(collectionName);
    return collection.find(query, options);
}

module.exports = {
    getMongoClient: getMongoClient,
    executeFind: executeFind,
};
