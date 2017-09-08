'use strict';

const server = require('./server.js');
const mongoUtils = require('./mongoUtils.js');
const RefGeneSource = require('./dataSources/refGeneSource.js');

var database = null;

mongoUtils.getRefGeneDatabase()
    .then((db) => {
        database = db
        return server.start({
            refGeneSource: new RefGeneSource(database)
        });
    })
    .catch(error => {
        console.error(error);
        if (database !== null) {
            database.close();
        }
    });
