const validate = require('jsonschema').validate;

/**
 * Makes sure that the input "looks like" a Gene object.  Can be used to validate JSON genes from the server, but since
 * validate() is slow, one should only use this function for debugging.
 * 
 * @param {object} obj - object to validate
 * @return {ValidationError[]} - array of validation errors, which will be empty if there were no errors.
 */
function validateGene(obj) { // eslint-disable-line no-unused-vars
    let validationResult = validate(obj, GENE_SCHEMA);
    return validationResult.errors;
}

const GENE_SCHEMA = { // Only used in validateGene, but it happens to serve as good documentation too.
    type: "object",
    properties: {
        chromosome: {type: "string"},
        start: {type: "integer"},
        end: {type: "integer"},
        accession: {type: "string"},
        id: {type: "integer"},
        strand: {type: "string"},
        exons: {
            type: "array",
            items: {type: "array"}
        },
        description: {type: "string"},
        name: {type: "string"},
    }
}

class Gene {
    constructor(plainObject, model) {
        Object.assign(this, plainObject); // Use validateGene() here for debugging if needed.

        if (model !== undefined) {
            this.absStart = model.chromosomeCoordinatesToBase(this.chromosome, this.start);
            this.absEnd = model.chromosomeCoordinatesToBase(this.chromosome, this.end);
            this.absExons = this.exons.map(exon => [
                model.chromosomeCoordinatesToBase(this.chromosome, exon[0]),
                model.chromosomeCoordinatesToBase(this.chromosome, exon[1]),
            ]);
            let absRegion = model.getAbsoluteRegion();
            this.isInView = this.absStart < absRegion.end && this.absEnd > absRegion.start;
        }
    }
}

export default Gene;
