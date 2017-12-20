import JSON5 from 'json5';
import Feature from './Feature';
const validate = require('jsonschema').validate;

/**
 * Makes sure that the input "looks like" a parsed BedRecord.  Can be used to validate records from BedSource once the
 * `details` prop is parsed.  Since validate() is slow, one should only use this function to debug.
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
 * A data container for gene annotations.
 * 
 * @author Silas Hsu
 */
class Gene extends Feature {
    /**
     * Parses a BedRecord, assuming its `details` prop is JSON-like, and makes a new Feature-like object with many
     * additional props.
     * 
     * @param {object} plainObject - object to make a copy of
     */
    constructor(plainObject, model) {
        const details = JSON5.parse('{' + plainObject.details + '}');
        details.struct = details.struct || {};

        super(details, plainObject.start, plainObject.end, true);
        this.chr = plainObject.chr || "";
        if (details.struct.thin) {
            this.exons = details.struct.thin;
        } else if (details.struct.thick) {
            this.exons = details.struct.thick;
        } else {
            this.exons = [];
        }

        const navContext = model.getNavigationContext();
        const interval = navContext.mapFromGenomeInterval(new Feature(this.chr, ...this.get0Indexed(), true));
        if (!interval) {
            throw new Error("Could not map gene location to navigation context");
        }

        this.absStart = interval.start;
        this.absEnd = interval.end;
        this.absExons = [];
        for (let exon of this.exons) {
            const exonInterval = navContext.mapFromGenomeInterval(new Feature(this.chr, exon[0], exon[1], true));
            if (exonInterval) {
                this.absExons.push(exonInterval)
            }
        }
        const absRegion = model.getAbsoluteRegion();
        this.isInView = this.absStart < absRegion.end && this.absEnd > absRegion.start;
    }

    /**
     * @inheritdoc
     */
    getName() {
        return this.details.name2 || this.details.name || "";
    }
}

export default Gene;
