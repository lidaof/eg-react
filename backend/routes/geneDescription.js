'use strict';

const Joi = require('joi');
const Boom = require('boom');
const mongoUtils = require('../mongoUtils');

const COLLECTION_NAME = 'kgXref';

/**
 * Registers the gene description API with a Hapi server.
 * 
 * @param {Server} server - Hapi server for which to register route
 */
function registerRoutes(server) {
    server.route({
        method: 'GET',
        path: '/{genome}/genes/{id}/description',
        handler: queryDescription,
        options: {
            description: 'Get gene description',
            notes: 'Returns gene description for a refGene ID',
            tags: ['api'],
            validate: {
                params: {
                    genome: Joi.string()
                        .required()
                        .description('Genome name')
                        .default('hg19'),
                    id: Joi.string()
                        .required()
                        .description('refGene ID')
                        .default('NR_037940'),
                }
            }
        } 
    });
}

/**
 * Request handler for the gene description API.  Requires presence of `mongoClient` in `server.app`.  Unknown gene IDs
 * will result in a 404.
 * 
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @return {Promise<Object>} description record, or empty object if not found
 */
async function queryDescription(request, h) {
    const mongoClient = request.server.app.mongoClient;
    const db = mongoClient.db(request.params.genome);
    const collection = db.collection(COLLECTION_NAME);
    const query = {refseq: encodeURIComponent(request.params.id)};
    try {
        const record = await collection.findOne(query);
        return record || Boom.notFound();
    } catch (error) {
        console.error(error);
        return Boom.badImplementation();
    }
}

module.exports = {
    registerRoutes: registerRoutes
};
