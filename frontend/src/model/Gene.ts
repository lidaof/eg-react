import Feature from './Feature';
import ChromosomeInterval from './interval/ChromosomeInterval';
import _ from 'lodash';
import axios from 'axios';
import OpenInterval from './interval/OpenInterval';
import DisplayedRegionModel from './DisplayedRegionModel';


/**
 *{
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
 *
 * @interface ReferenceGeneRecord
 */
interface ReferenceGeneRecord {
    _id: string;
    bin: number;
    name: string;
    chrom: string;
    strand: string;
    txStart: number;
    txEnd: number;
    cdsStart: number;
    cdsEnd: number;
    exonCount: number;
    exonStarts: string;
    exonEnds: string;
    score: number;
    name2: string;
    cdsStartStat: string;
    cdsEndStat: string;
    exonFrames: string;
}

/**
 * Locations of exons in navigation context coordinates
 */
interface AbsExons {
    absTranslated: OpenInterval[],
    absUtrs: OpenInterval[]
}

/**
 * A data container for gene annotations.
 * 
 * @author Daofeng Li and Silas Hsu
 */
class Gene extends Feature {
    refGeneRecord: ReferenceGeneRecord;
    _translated: OpenInterval[];
    _utrs: OpenInterval[];

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
    constructor(refGeneRecord: ReferenceGeneRecord) {
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
    private _parseDetails(): void {
        const {cdsStart, cdsEnd, exonStarts, exonEnds} = this.refGeneRecord;
        this._translated = [];
        this._utrs = [];
        if ([cdsStart, cdsEnd, exonStarts, exonEnds].some(value => value === undefined)) { // eslint-disable-line eqeqeq
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
     * Gets gene description by calling an API.
     * 
     * @param {string} genomeName - the name of the genome
     * @return {Promise<string>} - description of the gene
     */
    async getDescription(genomeName: string): Promise<string> {
        try {
            const response = await axios.get(`/${genomeName}/genes/${this.refGeneRecord.name}/description`);
            return response.data.description || "";
        } catch (error) {
            return "";
        }
    }

    /**
     * Gets the absolute locations of exons, given the gene body's location within the navigation context.  The
     * navigation context location need not cover the entire gene body, but it *must* overlap with it.
     * 
     * @param {DisplayedRegionModel} navContext - location in navigation context that overlaps this instance
     * @return {AbsExons} locations of exons in navigation context coordinates
     */
    getAbsExons(navContextLocation: DisplayedRegionModel): AbsExons {
        // The absolute location's genome start base.  Directly comparable with exons' base numbers.
        const navContext = navContextLocation.getNavigationContext();
        const absLocation = navContextLocation.getAbsoluteRegion();
        const absLocationGenomeBase = navContext
            .convertBaseToFeatureCoordinate(absLocation.start)
            .getGenomeCoordinates().start;
        const computeExonInterval = (exon: OpenInterval) => {
            const distFromAbsLocation = exon.start - absLocationGenomeBase;
            const start = absLocation.start + distFromAbsLocation;
            return absLocation.getOverlap( new OpenInterval(start, start + exon.getLength()) );
        }
        return {
            absTranslated: this.translated.map(computeExonInterval).filter(interval => interval != null),
            absUtrs: this.utrs.map(computeExonInterval).filter(interval => interval != null)
        };
    }
}

export default Gene;
