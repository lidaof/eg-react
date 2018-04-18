'use strict';

const _ = require('lodash');
const Joi = require('joi');
const Boom = require('boom');
const mongoUtils = require('../mongoUtils');

const COLLECTION_NAME = 'refGene';

/**
 * Registers the gene name query API with a Hapi server.
 * 
 * @param {Server} server - Hapi server for which to register route
 */
function registerRoutes(server) {
    server.route({
        method: 'GET',
        path:'/{genome}/genes/queryRegion',
        handler: queryGenesInRegion,
        options: {
            description: 'Query genes in region',
            notes: 'Returns list of refGene records in a genetic region',
            tags: ['api'],
            validate: {
                params: {
                    genome: Joi.string()
                        .required()
                        .description('Genome name')
                        .default('hg19'),
                },
                query: {
                    chr: Joi.string()
                        .required()
                        .description('Chromosome')
                        .default('chr7'),
                    start: Joi.number()
                        .required()
                        .description('Start base')
                        .default(27210209),
                    end: Joi.number()
                        .required()
                        .description('End base')
                        .default(27219880),
                }
            }
        } 
    });
}

/**
 * Request handler for the gene locus query API.  Requires presence of `mongoClient` in `server.app`.  Unknown genome
 * names will result in an empty array.
 * 
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @return {Promise<Array>} list of gene names records or records matching request query
 */
async function queryGenesInRegion(request, h) {
    const mongoClient = request.server.app.mongoClient;
    const query = {
        chrom: encodeURIComponent(request.query.chr),
        txStart: { $lt: Number.parseInt(request.query.end, 10) },
        txEnd: { $gt: Number.parseInt(request.query.start, 10) }
    };
    let findResult;
    try {
        return mongoUtils.executeFind(mongoClient, request.params.genome, COLLECTION_NAME, query).toArray();
    } catch (error) {
        console.error(error);
        return Boom.badImplementation();
    }
}

module.exports = {
    registerRoutes: registerRoutes
};
