import Feature from './Feature';
import ChromosomeInterval from './interval/ChromosomeInterval';
import _ from 'lodash';
import OpenInterval from './interval/OpenInterval';
import { FeatureSegment } from './interval/FeatureSegment';

export interface IdbRecord {
    id: string;
    name?: string;
    chrom: string;
    strand: string;
    txStart: number;
    txEnd: number;
    cdsStart: number;
    cdsEnd: number;
    exonStarts: string;
    exonEnds: string;
    transcriptionClass?: string;
    description?: string;
    collection?: string;
}

/**
 * A data container for gene annotations.
 *
 * @author Daofeng Li and Silas Hsu
 */
class Gene extends Feature {
    public dbRecord: any;
    public id: string;
    public description?: string;
    public transcriptionClass?: string;
    public collection?: string;
    _translated: OpenInterval[];
    _utrs: OpenInterval[];

    /**
     * Constructs a new Gene, given an entry from MongoDB.  The other parameters calculate nav context coordinates.
    @example
    {
        "_id": "5a6a4edfc019c4d5b606c0e8",
        "bin": 792, // UNUSED
        "name": "NR_037940", // 1
        "chrom": "chr7", // 2
        "strand": "-", // 3
        "txStart": 27202056, // 4
        "txEnd": 27219880, // 5
        "cdsStart": 27219880, // 6
        "cdsEnd": 27219880, // 7
        "exonCount": 3, // UNUSED
        "exonStarts": "27202056,27204496,27219264,", // 8
        "exonEnds": "27203460,27204586,27219880,", // 9
        "score": 0, // UNUSED
        "name2": "HOXA10-HOXA9", //10
        "cdsStartStat": "unk", // UNUSED
        "cdsEndStat": "unk", // UNUSED
        "exonFrames": "-1,-1,-1," // UNUSED
    }
     * @param {dbRecord} record - dbRecord object to use
     * @param {trackModel} trackModel for gene search information
     */
    constructor(dbRecord: IdbRecord) {
        const locus = new ChromosomeInterval(dbRecord.chrom, dbRecord.txStart, dbRecord.txEnd);
        super(dbRecord.name, locus, dbRecord.strand);
        this.dbRecord = dbRecord;
        this.id = dbRecord.id;
        this.name = dbRecord.name;
        this.description = dbRecord.description;
        this.transcriptionClass = dbRecord.transcriptionClass;
        this._translated = null;
        this._utrs = null;
        this.collection = dbRecord.collection;
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
     * Parses `this.dbRecord` and sets `this._translated` and `this._utrs`.
     */
    _parseDetails() {
        const { cdsStart, cdsEnd, exonStarts, exonEnds } = this.dbRecord;
        this._translated = [];
        this._utrs = [];
        // tslint:disable-next-line:triple-equals
        if ([cdsStart, cdsEnd, exonStarts, exonEnds].some(value => value == undefined)) {
            return;
        }

        const codingInterval = new OpenInterval(cdsStart, cdsEnd);
        const parsedExonStarts = _.trim(exonStarts, ',').split(',').map(n => Number.parseInt(n, 10));
        const parsedExonEnds = _.trim(exonEnds, ',').split(',').map(n => Number.parseInt(n, 10));
        const exons = _.zip(parsedExonStarts, parsedExonEnds)
            .map(([start, end]) => new OpenInterval(start, end));

        for (const exon of exons) { // Get UTRs and translated exons from the raw record
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
     * @return {object} exons as lists of FeatureSegment
     */
    getExonsAsFeatureSegments() {
        const convertOneExon = (exon: OpenInterval) => {
            const relativeStart = exon.start - this.locus.start;
            const relativeEnd = exon.end - this.locus.start;
            return new FeatureSegment(this, relativeStart, relativeEnd)
        }
        return {
            translated: this.translated.map(convertOneExon),
            utrs: this.utrs.map(convertOneExon)
        };
    }
}

export default Gene;
