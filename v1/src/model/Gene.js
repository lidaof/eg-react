import JSON5 from 'json5';
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
        chr: {type: "string"},
        start: {type: "integer"},
        end: {type: "integer"},
        details: {
            name: {type: "string"}, // More like ID
            name2: {type: "string"}, // Actual gene name
            strand: {type: "string"},
            id: {type: "integer"},
            desc: {type: "string"},
            struct: {
                thick: {type: "array"},
                thin: {type: "array"}
            }
        }
    }
}

/**
 * A simple data container for gene annotations.  Code that uses this class have certain expectations of the properties
 * of Gene, but they are not enforced since it is computationally expensive to do so.
 * 
 * @author Silas Hsu
 */
class Gene {
    /**
     * Simply makes a copy of the input object, and optionally merges additional properties related to absolute base
     * coordinates if given a {@link DisplayedRegionModel}.
     * 
     * @param {object} plainObject - object to make a copy of
     */
    constructor(plainObject, model) {
        Object.assign(this, plainObject); // Use validateGene() here for debugging if needed.
        this.details = JSON5.parse('{' + this.details + '}');
        this.chromosome = this.chr;
        this.details.name2 = this.details.name2 || this.details.name || "";
        this.details.struct = this.details.struct || {};

        if (this.details.struct.thin) {
            this.exons = this.details.struct.thin;
        } else if (this.details.struct.thick) {
            this.exons = this.details.struct.thick;
        } else {
            this.exons = [];
        }
    }

    /**
     * Sets a bunch of properties related to absolute base coordinates
     * 
     * @param {DisplayedRegionModel} model - model used to compute absolute base numbers
     */
    setModel(model) {
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

export default Gene;
