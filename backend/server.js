'use strict';

const Hapi = require('hapi');
const Good = require('good');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017'
const dbName = 'hg19';

const server = new Hapi.Server();

server.connection({port:3001, host: 'localhost'});

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply){
        reply('Hello, world!');
    }
});

server.route({
    method: 'GET',
    path: '/{name}',
    handler: function(request, reply){
        reply('Hello, ' + encodeURIComponent(request.params.name) + '!');
    }
});

function partialRefGeneSearch(q, db, callback){
    let collection = db.collection('refGene');
    //let query = {$or: [ {name: `/^${q}/i`}, {name2: `/^${q}/i`} ] };
    let query = {name2: `/^${q}/i`}
    console.log(query);
    let cursor = collection.find(query);
    cursor.each( (err, doc) => {
        assert.equal(err, null);
        if (doc != null){
            console.log(doc);
            return doc;
        }else{
            callback();
        }
    });
}

server.route({
    method: 'GET',
    path:'/hg19/refGene/{q}',
    handler: function(request, reply){
        MongoClient.connect(url, (err, client) => {
            assert.equal(null, err);
            const db = client.db(dbName);
            let que = encodeURIComponent(request.params.q);
            console.log(que);
            let res = partialRefGeneSearch(que, db, () => {
                client.close();
            });
            reply(res);
        });
    }
});

server.register({
    register: Good,
    options: {
        reporters: {
            console: [{
                module: 'good-squeeze',
                name: 'Squeeze',
                args: [{
                    response: '*',
                    log: '*'
                }]
            }, {
                module: 'good-console'
            }, 'stdout']
        }
    }
}, (err) => {

    if (err) {
        throw err; // something bad happened loading the plugin
    }

    server.start((err) => {

        if (err) {
            throw err;
        }
        server.log('info', 'Server running at: ' + server.info.uri);
    });
});