import Feature from './Feature';
import ChromosomeInterval from './interval/ChromosomeInterval';
import JSON5 from 'json5';
const validate = require('jsonschema').validate;

/**
 * Makes sure that the input the `details` part of Gene object is well-formed
 * 
 * @param {object} obj - object to validate
 * @return {ValidationError[]} - array of validation errors, which will be empty if there were no errors.
 */
function validateGene(obj) { // eslint-disable-line no-unused-vars
    let validationResult = validate(obj, DETAILS_SCHEMA);
    return validationResult.errors;
}

const DETAILS_SCHEMA = { // Only used in validateGene, but it happens to serve as good documentation too.
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

/**
 * A data container for gene annotations originating from hammock files.
 * 
 * @author Silas Hsu
 */
export class Gene extends Feature {
    /**
     * Constructs a new Gene, given a BedRecord from a hammock file.  The other parameters calculate absolute
     * coordinates.
     * 
     * @param {BedRecord} record - BedRecord-like object to use
     * @param {NavigationContext} navContext - used to calculate absolute coordinates
     * @param {FeatureSegment} featureSegment - a feature which overlaps this 
     */
    constructor(bedRecord, navContext, featureSegment) {
        const location = new ChromosomeInterval(bedRecord.chr, bedRecord.start, bedRecord.end);
        super(null, location);

        const absInterval = navContext.convertGenomeIntervalToBases(location, featureSegment);
        if (!absInterval) {
            throw new RangeError("Cannot map this gene to the navigation context");
        }

        [this.absStart, this.absEnd] = absInterval;
        this._navContext = navContext;
        this._featureSegment = featureSegment;
        this._unparsedDetails = bedRecord.details;
    }

    /**
     * @inheritdoc
     */
    getName() {
        const details = this.getDetails();
        return details.name2 || details.name || "";
    }

    /**
     * @inheritdoc
     */
    getIsForwardStrand() {
        const details = this.getDetails();
        return details.strand !== "-";
    }

    /**
     * Gets the detailed information originating from the last column of the hammock record.  Caution: this method is
     * slow, as it has to JSON parse the data.
     * 
     * @return {Object} detailed information of this record
     * @override
     */
    getDetails() {
        if (!this._details) {
            let details = JSON5.parse('{' + this._unparsedDetails + '}');

            // Set details.exons
            details.struct = details.struct || {};
            if (details.struct.thin !== undefined) {
                details.exons = details.struct.thin;
            } else if (details.struct.thick !== undefined) {
                details.exons = details.struct.thick;
            } else {
                details.exons = [];
            }

            // Set details.absExons
            details.absExons = [];
            for (let exon of details.exons) {
                const exonLocation = new ChromosomeInterval(this.getLocus().chr, ...exon);
                const exonInterval = this._navContext.convertGenomeIntervalToBases(exonLocation, this._featureSegment);
                if (exonInterval) {
                    details.absExons.push(exonInterval)
                }
            }

            this._details = details;
        }
        return this._details;
    }
}

/**
 * Turns BedRecords into Genes.
 * 
 * @author Silas Hsu
 */
export class GeneFormatter {
    /**
     * Turns BedRecords into Genes.  The second and third parameters exist to assist mapping to a navigation context.
     * Genes that fail mapping will be ignored and skipped.
     * 
     * @param {BedRecord[]} bedRecords - the records to convert
     * @param {DisplayedRegionModel} region - object containing navigation context and view region
     * @param {FeatureSegment} feature - feature in navigation context to map to
     * @return {Gene[]} array of Gene
     */
    format(records, region, feature) {
        let genes = [];
        for (let record of records) {
            try {
                genes.push(new Gene(record, region.getNavigationContext(), feature));
            } catch (error) {

            }
        }
        return genes;
    }
}

export default Gene;
