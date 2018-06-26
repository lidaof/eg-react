'use strict';

const _ = require('lodash');
const Joi = require('joi');
const Boom = require('boom');
const mongoUtils = require('../mongoUtils');

const RECORDS_LIMIT = 50;
const genomeConfig = require('../setup/genomeConfig');

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
                        .default('hg19')
                },
                query: {
                    q: Joi.string()
                        .required()
                        .description('String that gene name must start with'),
                    isExact: Joi.bool()
                        .description('Whether the query must match exactly')
                        .default(false),
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
    const genome = request.params.genome
    const endAssertion = request.query.isExact ? '$' : '';
    const query = {
        name: {
            $regex: `^${encodeURIComponent(request.query.q)}${endAssertion}`,
            $options: 'i' // i means case insensitive
        }
    };

    const collectionsForGenome = genomeConfig[genome];
    if (!collectionsForGenome) {
        return Boom.notFound(`Genome "${genome}" not found.`);
    }

    let results = [];
    for (const collection of collectionsForGenome) {
        let findResult;
        try {
            findResult = await mongoUtils
                .executeFind(mongoClient, genome, collection.name, query)
                .limit(RECORDS_LIMIT)
                .toArray();
        } catch (error) {
            console.error(error);
            return Boom.badGateway();
        }

        for (const geneRecord of findResult) { // Inject collection name into the records
            geneRecord.collection = collection.name;
        }
        results.push(findResult);
    }
    results = _.flatten(results);

    if (request.query.getOnlyNames) {
        return _.uniq(results.map(record => record.name));
    } else {
        return results;
    }
}

module.exports = {
    registerRoutes: registerRoutes
};
