import Feature from './Feature';
import ChromosomeInterval from './interval/ChromosomeInterval';
import _ from 'lodash';
import axios from 'axios';
import OpenInterval from './interval/OpenInterval';

/**
 * A data container for gene annotations originating from hammock files.
 * 
 * @author Daofeng Li, modified from Silas Hsu's Gene component
 */

export class Gene extends Feature {
    /**
     * Constructs a new Gene, given an entry from mongodb.  The other parameters calculate absolute
     * coordinates.
    {
        "_id": "5a6a4edfc019c4d5b606c0e8",
        "bin": 792,
        "name": "NR_037940",
        "chrom": "chr7",
        "strand": "-",
        "txStart": 27202056,
        "txEnd": 27219880,
        "cdsStart": 27219880,
        "cdsEnd": 27219880,
        "exonCount": 3,
        "exonStarts": "27202056,27204496,27219264,",
        "exonEnds": "27203460,27204586,27219880,",
        "score": 0,
        "name2": "HOXA10-HOXA9",
        "cdsStartStat": "unk",
        "cdsEndStat": "unk",
        "exonFrames": "-1,-1,-1,"
    }
     * @param {RefGeneRecord} record - refGeneRecord object to use
     */
    constructor(refGeneRecord) {
        const location = new ChromosomeInterval(refGeneRecord.chrom, refGeneRecord.txStart, refGeneRecord.txEnd);
        super(refGeneRecord.name2, location, refGeneRecord.strand === "+");
        this.refGeneRecord = refGeneRecord;
        this._parseDetails();
    }

    /**
     * Parses `this.refGeneRecord` and sets `this.translated` and `this.utrs`.
     */
    _parseDetails() {
        const {cdsStart, cdsEnd, exonStarts, exonEnds} = this.refGeneRecord;
        this.translated = [];
        this.utrs = [];
        if ([cdsStart, cdsEnd, exonStarts, exonEnds].some(value => value == undefined)) { // eslint-disable-line eqeqeq
            return;
        }

        const codingInterval = new OpenInterval(cdsStart, cdsEnd);
        const parsedExonStarts = _.trim(exonStarts, ',').split(',').map(n => Number.parseInt(n, 10));
        const parsedExonEnds = _.trim(exonEnds, ',').split(',').map(n => Number.parseInt(n, 10));
        let exons = _.zip(parsedExonStarts, parsedExonEnds)
            .map(twoElementArray => new OpenInterval(...twoElementArray));

        for (let exon of exons) { // Get UTRs and translated exons from the raw record
            const codingOverlap = codingInterval.getOverlap(exon);
            if (codingOverlap) {
                this.translated.push(codingOverlap);

                if (exon.start < codingOverlap.start) { // 5' UTR
                    this.utrs.push(new OpenInterval(exon.start, codingOverlap.start));
                }
                if (codingOverlap.end < exon.end) { // 3' UTR
                    this.utrs.push(new OpenInterval(codingOverlap.end, exon.end));
                }
            } else {
                 // If the length of the coding interval is 0 (i.e. a pseudogene), there will be no overlap and all the
                 // exons will be interpreted as untranslated.
                 this.utrs.push(exon);
            }
        }
    }

    /**
     * async function to get gene description by calling the API
     */
    async getDescription() {
        const response = await axios.get(`/hg19/refseqDesc/${this.refGeneRecord.name}`);
        return response.data[0] ? response.data[0].description : "";
    }

    /**
     * Calculates absolute coordinates of the gene body and exons.  Mutates this object by setting absStart, absEnd,
     * absTranslated, and absUtrs.
     * 
     * @param {NavigationContext} navContext - context with which to calculate absolute base numbers
     * @param {string | Feature | FeatureInterval} [targetFeature] - target location in context to map to
     * @throws {RangeError} if this instance is not in the navigation context
     */
    computeNavContextCoordinates(navContext, targetFeature) {
        const chr = this.getLocus().chr;
        const absInterval = navContext.convertGenomeIntervalToBases(this.getLocus(), targetFeature);
        
        this.absStart = absInterval.start;
        this.absEnd = absInterval.end;
        this.absTranslated = [];
        this.absUtrs = [];

        const safePush = function(array, exon) {
            try {
                array.push(
                    navContext.convertGenomeIntervalToBases(new ChromosomeInterval(chr, ...exon), targetFeature)
                );
            } catch (error) { // Ignore RangeErrors from convertGenomeIntervalToBases; let others bubble up.
                if (!error instanceof RangeError) {
                    throw error;
                }
            }
        }

        for (let exon of this.translated) {
            safePush(this.absTranslated, exon);
        }

        for (let utr of this.utrs) {
            safePush(this.absUtrs, utr);
        }
    }
}

/**
 * Turns BedRecords into Genes.
 * 
 * @author Silas Hsu
 */
export class GeneFormatter {
    /**
     * Turns dbRecords into Genes.  The second and third parameters exist to assist mapping to a navigation context.
     * Genes that fail mapping will be ignored and skipped.
     * 
     * @param {refGeneRecords[]} refGeneRecords - the records to convert
     * @param {DisplayedRegionModel} region - object containing navigation context and view region
     * @param {FeatureInterval} feature - feature in navigation context to map to
     * @return {Gene[]} array of Gene
     */
    format(records, region, featureInterval) {
        let genes = [];
        for (let record of records) {
            const gene = new Gene(record);
            gene.computeNavContextCoordinates(region.getNavigationContext(), featureInterval.feature);
            genes.push(gene);
        }
        return genes;
    }
}

export default Gene;
