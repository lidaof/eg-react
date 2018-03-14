'use strict';

const Boom = require('boom');
const Joi = require('joi');

const refGeneRoute = {
    method: 'GET',
    path:'/refGene/{genomeName}',
    handler: function (request, reply) {
        let query = request.query; // Query params are guaranteed to be the right types due to validate config
        if (query.end < query.start) {
            return reply(Boom.badRequest("End must be greater than start"));
        }
        
        request.server.app.refGeneSource.query(request.params.genomeName, query.chromosome, query.start, query.end)
            .then(reply)
            .catch((error) => {
                if (error.isBoom) {
                    return reply(error);
                } else {
                    return reply(Boom.badImplementation(error.toString()));
                }
            });
    },
    config: {
        validate: {
            query: {
                chromosome: Joi.string().min(1).required(),
                start: Joi.number().integer().min(1).required(),
                end: Joi.number().integer().min(1).required(),
            }
        }
    }
}

function configServer(server, refGeneSource) {
    server.app.refGeneSource = refGeneSource;
    server.route(refGeneRoute);
}

module.exports = configServer;
