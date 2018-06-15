"use strict";

const Joi = require("joi");
const Boom = require("boom");

const genomeConfig = require("../setup/genomeConfig");
/**
 * Registers the gene description API with a Hapi server.
 *
 * @param {Server} server - Hapi server for which to register route
 */
function registerRoutes(server) {
  server.route({
    method: "GET",
    path: "/{genome}/genes/{collection}/{id}/description",
    handler: queryDescription,
    options: {
      description: "Get gene description",
      notes: "Returns gene description for a Gene ID",
      tags: ["api"],
      validate: {
        params: {
          genome: Joi.string()
            .required()
            .description("Genome name")
            .default("hg19"),
          collection: Joi.string()
            .required()
            .description("Gene collection name")
            .default("refGene"),
          id: Joi.string()
            .required()
            .description("Gene ID")
            .default("NR_037940")
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
  const genome = request.params.genome;
  const config = genomeConfig[genome].find(
    g => g.name === request.params.collection
  );
  const field = config.descriptionSearch.field;

  const db = mongoClient.db(genome);
  const collection = db.collection(config.descriptionSearch.name);
  const query = {
    [field]: encodeURIComponent(request.params.id)
  };
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
