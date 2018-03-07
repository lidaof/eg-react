'use strict';

const Hapi = require('hapi');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const Good = require('good');
const Joi = require('joi');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const  _ = require('lodash');

const url = 'mongodb://localhost:27017'
const dbName = 'hg19';

const NAME_SEARCH_LIMIT = 50;

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

const partialRefGeneSearch = async function (request, h){
    let query = {name2: { $regex: `^${encodeURIComponent(request.params.q)}`, $options: 'i' } };
    try {
        const mongoClient = await promiseMongoConnect(url);
        const db = mongoClient.db(dbName);
        const collection = db.collection('refGene');
        const findResult = await collection.find(query, {
            fields: { _id: 0, name2: 1 }
        });
        const arrayResult = await findResult.limit(NAME_SEARCH_LIMIT).toArray();
        return _.uniq(arrayResult.map(record => record.name2));
    } catch (err) {
        console.log(err);
        return {err2: err};
    }
}

const refGeneSearch = async function (request, h){
    let query = {$or: [ {name: { $regex: `^${encodeURIComponent(request.params.q)}$`, $options: 'i' } }, {name2: { $regex: `^${encodeURIComponent(request.params.q)}$`, $options: 'i' } } ] };
    try {
        const mongoClient = await promiseMongoConnect(url);
        const db = mongoClient.db(dbName);
        const collection = db.collection('refGene');
        const findResult = await collection.find(query);
        return findResult.limit(NAME_SEARCH_LIMIT).toArray();
    } catch (err) {
        return {err: err};
    }
}

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
        const findResult = await collection.find(query);
        return findResult.toArray();
    } catch (err) {
        return {err: err};
    }
}

const refseqDesc = async function (request, h){
    let query = {refseq: encodeURIComponent(request.params.q)};
    try {
        const mongoClient = await promiseMongoConnect(url);
        const db = mongoClient.db(dbName);
        const collection = db.collection('kgXref');
        const findResult = await collection.find(query, {
            fields: { _id: 0, refseq: 1, description: 1 }
        });
        return findResult.toArray();
    } catch (err) {
        return {err: err};
    }
}

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

const myServer = async () => {
    const server = await new Hapi.Server({
        host: 'localhost',
        port: 3001,
    });
    
    const swaggerOptions = {
        info: {
                title: 'eg-react API Documentation',
            },
    };

    const goodOptions = {
        ops: {
            interval: 1000
        },
        reporters: {
            myConsoleReporter: [{
                module: 'good-squeeze',
                name: 'Squeeze',
                args: [{ log: '*', response: '*' }]
            }, {
                module: 'good-console'
            }, 'stdout'],
        }
    };
    
    await server.register([
        Inert,
        Vision,
        {
            plugin: HapiSwagger,
            options: swaggerOptions
        },
        {
            plugin: Good,
            options: goodOptions
        }
    ]);
    
    try {
        await server.start();
        console.log('Server running at:', server.info.uri);
    } catch(err) {
        console.log(err);
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

    server.route({
        method: 'GET',
        path:'/hg19/geneSuggest/{q}',
        options: {
            handler: partialRefGeneSearch,
            description: 'start string of gene symbol',
            notes: 'Returns list of gene symbols matching query string',
            tags: ['api'],
            validate: {
                params: {
                    q : Joi.string()
                            .required()
                            .description('the start string of a gene symbol').default('HOXA'),
                }
            }
        } 
    });
    
    server.route({
        method: 'GET',
        path:'/hg19/refGene/{q}',
        options: {
            handler: refGeneSearch,
            description: 'search gene symbol',
            notes: 'Returns list of refGene entries matching query symbol',
            tags: ['api'],
            validate: {
                params: {
                    q : Joi.string()
                            .required()
                            .description('a gene symbol').default('TP53'),
                }
            }
        } 
    });

    server.route({
        method: 'GET',
        path:'/hg19/geneQuery/{chr}/{start}/{end}',
        options: {
            handler: regionGeneQuery,
            description: 'query genes in region',
            notes: 'Returns list of refGene entries between start and end',
            tags: ['api'],
            validate: {
                params: {
                    chr : Joi.string()
                            .required()
                            .description('chromosome').default('chr7'),
                    start : Joi.number()
                            .required()
                            .description('start').default(27210209),
                    end : Joi.number()
                            .required()
                            .description('end').default(27219880),    
                }
            }
        } 
    });
 
    server.route({
        method: 'GET',
        path:'/hg19/refseqDesc/{q}',
        options: {
            handler: refseqDesc,
            description: 'get gene description',
            notes: 'Returns gene description',
            tags: ['api'],
            validate: {
                params: {
                    q : Joi.string()
                            .required()
                            .description('refGene ID').default('NR_037940'),  
                }
            }
        } 
    });

    server.route({
        method: 'GET',
        path:'/hg19/cytoBand/{q}',
        options: {
            handler: cytoBandSearch,
            description: 'get cytoband info',
            notes: 'get cytoband info',
            tags: ['api'],
            validate: {
                params: {
                    q : Joi.string()
                            .required()
                            .description('chromosome').default('chr22'),  
                }
            }
        } 
    });

};
myServer();
