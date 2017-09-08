const MongoClient = require('mongodb').MongoClient;

const REF_GENE_URL = "mongodb://localhost:27017/refGene";

function getRefGeneDatabase() {
    return MongoClient.connect(REF_GENE_URL);
}

function findCollection(database, nameToFind) {
    return database.listCollections().toArray()
        .then((collections) => {
            return collections.find(collection => collection.name === nameToFind) || null;
        });
}

module.exports = {
    getRefGeneDatabase: getRefGeneDatabase,
    findCollection: findCollection,
}
