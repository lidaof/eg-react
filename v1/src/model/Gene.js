import Feature from './Feature';
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
     * @param {DisplayedRegionModel} displayedRegion - used to calculate certain props, such as being in view
     * @param {string} segmentName - the segment in the model in which the Gene lies
     */
    constructor(bedRecord, displayedRegion, segmentName) {
        const navContext = displayedRegion.getNavigationContext();

        super(null, bedRecord.start, bedRecord.end, true);
        this._region = displayedRegion;
        this._segmentName = segmentName;
        this._unparsedDetails = bedRecord.details;

        // Set public variables chr, absStart, absEnd, absRegion, isInView
        this.chr = bedRecord.chr;
        [this.absStart, this.absEnd] = navContext.mapFromGenome(
            new Feature(this.chr, ...this.get0Indexed(), true), segmentName
        );
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
                const exonInterval = this._region.getNavigationContext().mapFromGenome(
                    new Feature(this.chr, ...exon, true), this._segmentName
                );
                if (exonInterval) {
                    details.absExons.push(exonInterval)
                }
            }

            this._details = details;
        }
        return this._details;
    }

    _exonToFeature(rawExon, index) {
        return new Feature(`Exon ${index + 1}`, rawExon[0], rawExon[1], true);
    }

    /**
     * @inheritdoc
     */
    getName() {
        const details = this.getDetails();
        return details.name2 || details.name || "";
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
     * @param {Feature} segment
     * @override
     */
    format(records, region, segment) {
        const segmentName = segment.getName();
        return records.map(record => new Gene(record, region, segmentName));
    }
}

export default Gene;
