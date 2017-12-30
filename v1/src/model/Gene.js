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
     * @param {FeatureInterval} featureInterval - a feature which overlaps this 
     */
    constructor(bedRecord, navContext, featureInterval) {
        const location = new ChromosomeInterval(bedRecord.chr, bedRecord.start, bedRecord.end);
        super(null, location);

        const absInterval = navContext.convertGenomeIntervalToBases(featureInterval, location);
        if (!absInterval) {
            throw new RangeError("Given feature does not overlap with this Gene; cannot map to navigation context");
        }

        [this.absStart, this.absEnd] = absInterval;
        this._navContext = navContext;
        this._featureInterval = featureInterval;
        this._unparsedDetails = bedRecord.details;
    }

    /**
     * @override
     */
    getName() {
        const details = this.getDetails();
        return details.name2 || details.name || "";
    }

    /**
     * Gets whether this overlaps a region
     * 
     * @param {DisplayedRegionModel} region - region to check
     * @return {boolean} whether this overlaps the displayed region
     */
    getIsInView(region) {
        const absRegion = region.getAbsoluteRegion();
        return this.absStart < absRegion.end && this.absEnd > absRegion.start;
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
                const exonLocation = new ChromosomeInterval(this.getCoordinates().chr, ...exon);
                const exonInterval = this._navContext.convertGenomeIntervalToBases(this._featureInterval, exonLocation);
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
 */
export class GeneFormatter {
    /**
     * Turns BedRecords into Genes
     * 
     * @param {BedRecord[]} bedRecords 
     * @param {DisplayedRegionModel} region
     * @param {FeatureInterval} segment
     * @override
     */
    format(records, region, segment) {
        return records.map(record => new Gene(record, region.getNavigationContext(), segment));
    }
}

export default Gene;
