import Feature from './Feature';
import ChromosomeInterval from './interval/ChromosomeInterval';
import _ from 'lodash';
import axios from 'axios';
import OpenInterval from './interval/OpenInterval';

/**
 * A data container for gene annotations.
 * 
 * @author Daofeng Li and Silas Hsu
 */
class Gene extends Feature {
    /**
     * Constructs a new Gene, given an entry from MongoDB.  The other parameters calculate absolute
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
        const locus = new ChromosomeInterval(refGeneRecord.chrom, refGeneRecord.txStart, refGeneRecord.txEnd);
        super(refGeneRecord.name2, locus, refGeneRecord.strand);
        this.refGeneRecord = refGeneRecord;
        this._translated = null;
        this._utrs = null;
    }

    get translated() {
        if (this._translated === null) {
            this._parseDetails();
        }
        return this._translated;
    }

    get utrs() {
        if (this._utrs === null) {
            this._parseDetails();
        }
        return this._utrs;
    }

    /**
     * Parses `this.refGeneRecord` and sets `this._translated` and `this._utrs`.
     */
    _parseDetails() {
        const {cdsStart, cdsEnd, exonStarts, exonEnds} = this.refGeneRecord;
        this._translated = [];
        this._utrs = [];
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
                this._translated.push(codingOverlap);

                if (exon.start < codingOverlap.start) { // 5' UTR
                    this._utrs.push(new OpenInterval(exon.start, codingOverlap.start));
                }
                if (codingOverlap.end < exon.end) { // 3' UTR
                    this._utrs.push(new OpenInterval(codingOverlap.end, exon.end));
                }
            } else {
                 // If the length of the coding interval is 0 (i.e. a pseudogene), there will be no overlap and all the
                 // exons will be interpreted as untranslated.
                 this._utrs.push(exon);
            }
        }
    }

    /**
     * Gets gene description by calling an API.
     * 
     * @param {string} genomeName - the name of the genome
     * @return {Promise<string>} - description of the gene
     */
    async getDescription(genomeName) {
        const response = await axios.get(`/${genomeName}/refseqDesc/${this.refGeneRecord.name}`);
        return response.data[0] ? response.data[0].description : "";
    }

    getAbsExons(absLocation) {
        const locusStart = this.getLocus().start;
        const computeInternalInterval = function(interval) {
            const startDistFromLocus = interval.start - locusStart;
            const endDistFromLocus = interval.end - locusStart;
            return absLocation.getOverlap(
                new OpenInterval(absLocation.start + startDistFromLocus, absLocation.start + endDistFromLocus)
            );
        }
        return {
            absTranslated: this.translated.map(computeInternalInterval).filter(interval => interval != null),
            absUtrs: this.utrs.map(computeInternalInterval).filter(interval => interval != null)
        };
    }
}

export default Gene;
