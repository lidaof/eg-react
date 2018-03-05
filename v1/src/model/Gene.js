import Feature from './Feature';
import ChromosomeInterval from './interval/ChromosomeInterval';
import _ from 'lodash';
import axios from 'axios';
import { OpenInterval } from './interval/OpenInterval';

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
     * @param {RefGeneRecord} record - refGeneRecod object to use
     */
    constructor(refGeneRecord) {
        // tx n
        const location = new ChromosomeInterval(refGeneRecord.chrom, refGeneRecord.txStart, refGeneRecord.txEnd);
        super(refGeneRecord.name2, location, refGeneRecord.strand === "+");
        this.refGeneRecord = refGeneRecord;
        this._parseDetails();
    }

    _parseDetails() {
        const {cdsStart, cdsEnd, exonStarts, exonEnds} = this.refGeneRecord;
        const codingInterval = new OpenInterval(cdsStart, cdsEnd);
        const parsedExonStarts = _.trim(exonStarts, ',').split(',').map(n => Number.parseInt(n, 10));
        const parsedExonEnds = _.trim(exonEnds, ',').split(',').map(n => Number.parseInt(n, 10));
        let exons = _.zip(parsedExonStarts, parsedExonEnds)
            .map(twoElementArray => new OpenInterval(...twoElementArray));

        this.translated = [];
        this.utrs = [];
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

    computeNavContextCoordinates(navContext, targetFeature) {
        const transcribed = navContext.convertGenomeIntervalToBases(this.getLocus(), targetFeature);
        const chr = this.getLocus().chr;
        
        this.absStart = transcribed.start;
        this.absEnd = transcribed.end;
        this.absTranslated = this.translated.map(exon =>
            navContext.convertGenomeIntervalToBases(new ChromosomeInterval(chr, ...exon), targetFeature)
        );
        this.absUtrs = this.utrs.map(exon =>
            navContext.convertGenomeIntervalToBases(new ChromosomeInterval(chr, ...exon), targetFeature)
        );
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
