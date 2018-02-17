'use strict';

const Hapi = require('hapi');
const Good = require('good');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const  _ = require('lodash');

const url = 'mongodb://localhost:27017'
const dbName = 'hg19';

const NAME_SEARCH_LIMIT = 50;

const server = new Hapi.Server({port:3001, host: '0.0.0.0'});

function promiseMongoConnect(url) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, (err, client) => {
            if (err) {
                reject(err);
            } else {
                resolve(client);
            }
        });
    });
}

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, h){
        return 'Hello, world!';
    }
});

server.route({
    method: 'GET',
    path: '/{name}',
    handler: function(request, h){
        return 'Hello, ' + encodeURIComponent(request.params.name) + '!';
    }
});

const partialRefGeneSearch = async function (request, h){
    let query = {name2: { $regex: `^${encodeURIComponent(request.params.q)}`, $options: 'i' } };
    try {
        const mongoClient = await promiseMongoConnect(url);
        const db = mongoClient.db(dbName);
        const collection = db.collection('refGene');
        const findResult = await collection.find(query, {
            fields: { _id: 0, name2: 1 }
        });
        // return findResult.limit(NAME_SEARCH_LIMIT).toArray().then((res) =>{
        //     let res2 = [];
        //     res.forEach(r => res2.push(r.name2));
        //     //console.log(res2)
        //     return _.uniq(res2);
        // });
        const arrayResult = await findResult.limit(NAME_SEARCH_LIMIT).toArray();
        return _.uniq(arrayResult.map(record => record.name2));
    } catch (err) {
        console.log(err);
        return {err2: err};
    }
}

server.route({
    method: 'GET',
    path:'/hg19/geneSuggest/{q}',
    handler: partialRefGeneSearch
});

const refGeneSearch = async function (request, h){
    let query = {$or: [ {name: { $regex: `^${encodeURIComponent(request.params.q)}$`, $options: 'i' } }, {name2: { $regex: `^${encodeURIComponent(request.params.q)}$`, $options: 'i' } } ] };
    try {
        const mongoClient = await promiseMongoConnect(url);
        const db = mongoClient.db(dbName);
        const collection = db.collection('refGene');
        const findResult = await collection.find(query, {
            fields: { _id: 0, name: 1, chrom: 1, strand:1, txStart:1, txEnd:1, name2: 1 }
        });
        return findResult.limit(NAME_SEARCH_LIMIT).toArray();
    } catch (err) {
        return {err: err};
    }
}

server.route({
    method: 'GET',
    path:'/hg19/refGene/{q}',
    handler: refGeneSearch
});

const regionGeneQuery = async function(request, h){   
    const query = {
        chrom: encodeURIComponent(request.params.chr),
        txStart: { $lt: Number.parseInt(request.params.end, 10) },
        txEnd: { $gt: Number.parseInt(request.params.start, 10) }
    };
    console.log(query);
    try {
        const mongoClient = await promiseMongoConnect(url);
        const db = mongoClient.db(dbName);
        const collection = db.collection('refGene');
        const findResult = await collection.find(query, {
            fields: { _id: 0, name: 1, chrom: 1, strand:1, txStart:1, txEnd:1, name2: 1 }
        });
        return findResult.toArray();
    } catch (err) {
        return {err: err};
    }
}



server.route({
    method: 'GET',
    path:'/hg19/geneQuery/{chr}/{start}/{end}',
    handler: regionGeneQuery
});

const cytoBandSearch = async function (request, h){
    let query = {chrom: encodeURIComponent(request.params.q)};
    try {
        const mongoClient = await promiseMongoConnect(url);
        const db = mongoClient.db(dbName);
        const collection = db.collection('cytoBand');
        const findResult = await collection.find(query);
        return findResult.toArray();
    } catch (err) {
        return {err: err};
    }
}

server.route({
    method: 'GET',
    path:'/hg19/cytoBand/{q}',
    handler: cytoBandSearch
});

server  
  .start()
  .then(() => { server.log('info', `Server started at ${server.info.uri}`); }) 
  .catch(err => {
    console.log(err)
  })
  
//   server  
//   .stop()
//   .catch(err => {
//     console.log(err)
//   })
  