import Feature from './Feature';
import ChromosomeInterval from './interval/ChromosomeInterval';
import _ from 'lodash';
import axios from 'axios';

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
     * @param {NavigationContext} navContext - used to calculate absolute coordinates
     * @param {FeatureInterval} featureInterval - a feature which overlaps this 
     */
    constructor(refGeneRecord, navContext, featureInterval) {
        
        const location = new ChromosomeInterval(refGeneRecord.chrom, refGeneRecord.txStart, refGeneRecord.txEnd);
        super(null, location);

        const absInterval = navContext.convertGenomeIntervalToBases(featureInterval, location);
        if (!absInterval) {
            throw new RangeError("Cannot map this gene to the navigation context");
        }

        [this.absStart, this.absEnd] = absInterval;
        this._navContext = navContext;
        this._featureInterval = featureInterval;
        this.refGeneRecord = refGeneRecord;
        this._details = this.getDetails();
        this.strand = this.refGeneRecord.strand;
        this.id = this.refGeneRecord._id;
        this.length = this.refGeneRecord.txEnd - this.refGeneRecord.txStart;
    }

    /**
     * @inheritdoc
     */
    getName() {
        return this.refGeneRecord.name2 || this.refGeneRecord.name || "";
    }

    /**
     * async function to get gene description by calling the API
     */
    async getDescription(){
        const response = await axios.get(`/hg19/refseqDesc/${this.refGeneRecord.name}`);
        return response.data[0] ? response.data[0].description : "";
    }

    /**
     * @inheritdoc
     */
    getIsForwardStrand() {
        return this.refGeneRecord.strand !== "-";
    }

    /**
     * Gets the detailed information originating from the last column of the hammock record.  Caution: this method is
     * slow, as it has to JSON parse the data.
     * 
     * @return {Object} detailed information of this record
     * @override
     */
    getDetails() {
        const details = {};
        const {cdsStart, cdsEnd, exonStarts, exonEnds} = this.refGeneRecord;
        const exonStartList = _.trim(exonStarts,',').split(',').map(n => Number.parseInt(n, 10));
        const exonEndList = _.trim(exonEnds,',').split(',').map(n => Number.parseInt(n, 10));
        if(cdsStart === cdsEnd){
            let tmp = [];
            for (const idx of exonStartList.keys()){
                tmp.push([exonStartList[idx], exonEndList[idx]]);
            }
            details['thin'] = tmp;
            //how to skip the next for loop?
        }
        const thick = [], thin = [];
        for (const idx of exonStartList.keys()){
            let start = exonStartList[idx], end = exonEndList[idx];
            if (end <= cdsStart){
                thin.push([start, end]);
            }else if(end <= cdsEnd){
                if (start < cdsStart){
                    thin.push([start, cdsStart]);
                    thick.push([cdsStart, end]);
                } else {
                    thick.push([start, end]);
                }
            }else{
                if(start < cdsStart){
                    thin.push([start, cdsStart]);
                    thin.push([cdsEnd, end]);
                    thick.push([cdsStart, cdsEnd]);
                }else{
                    if (start < cdsEnd){
                        thick.push([start, cdsEnd]);
                        thin.push([cdsEnd, end]);
                    }else{
                        thin.push([start, end]);
                    }
                }
            }
        }
        if (thin.length > 0){
            details['thin'] = thin;
        }
        if (thick.length > 0){
            details['thick'] = thick;
        }
        // Set details.absExons
        details.absExons = [];
        if (details.thick) {
            for (let exon of details.thick) {
                const exonLocation = new ChromosomeInterval(this.getLocus().chr, ...exon);
                const exonInterval = this._navContext.convertGenomeIntervalToBases(this._featureInterval, exonLocation);
                if (exonInterval) {
                    details.absExons.push(exonInterval)
                }
            }
        }
        
        // Set details.absUtrs
        details.absUtrs = [];
        if (details.thin) {
            for (let utr of details.thin) {
                const utrLocation = new ChromosomeInterval(this.getLocus().chr, ...utr);
                const utrInterval = this._navContext.convertGenomeIntervalToBases(this._featureInterval, utrLocation);
                if (utrInterval) {
                    details.absUtrs.push(utrInterval)
                }
            }
        }
        
        return details;
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
    format(records, region, feature) {
        let genes = [];
        for (let record of records) {
            try {
                genes.push(new Gene(record, region.getNavigationContext(), feature));
            } catch (error) {
                console.error(error);
            }
        }
        return genes;
    }
}

export default Gene;
