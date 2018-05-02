'use strict';

const _ = require('lodash');
const Joi = require('joi');
const Boom = require('boom');
const mongoUtils = require('../mongoUtils');

const COLLECTION_NAME = 'refGene';
const RECORDS_LIMIT = 50;

/**
 * Registers the gene name query API with a Hapi server.
 * 
 * @param {Server} server - Hapi server for which to register route
 */
function registerRoutes(server) {
    server.route({
        method: 'GET',
        path: '/{genome}/genes/queryName',
        handler: queryGenesWithName,
        options: {
            description: 'Gene name query',
            notes: 'Returns list of gene names or refGene records matching query',
            tags: ['api'],
            validate: {
                params: {
                    genome: Joi.string()
                        .required()
                        .description('Genome name')
                        .default('hg19'),
                },
                query: {
                    q: Joi.string().required().description('String that gene name must start with'),
                    isExact: Joi.bool().description('Whether the query must match exactly').default(false),
                    getOnlyNames: Joi.bool()
                        .description('Whether to get only a list of matching names, or full records')
                        .default(false)
                }
            }
        }
    });
}

/**
 * Request handler for the gene name query API.  Requires presence of `mongoClient` in `server.app`.  Unknown genome
 * names will result in an empty array.
 * 
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @return {Promise<Array>} list of gene names records or records matching request query
 */
async function queryGenesWithName(request, h) {
    const mongoClient = request.server.app.mongoClient;
    const regexEndChar = request.query.isExact ? '$' : '';
    const query = {
        name2: {
            $regex: `^${encodeURIComponent(request.query.q)}${regexEndChar}`, $options: 'i' // i means case insensitive
        }
    };

    let findResult;
    try {
        findResult = await mongoUtils.executeFind(mongoClient, request.params.genome, COLLECTION_NAME, query)
            .limit(RECORDS_LIMIT)
            .toArray();
    } catch (error) {
        console.error(error);
        return Boom.badImplementation();
    }

    if (request.query.getOnlyNames) {
        return _.uniq(findResult.map(record => record.name2));
    } else {
        return findResult;
    }
}

module.exports = {
    registerRoutes: registerRoutes
};
