import React from 'react';
import Feature from './Feature';
import ChromosomeInterval from './interval/ChromosomeInterval';
import _ from 'lodash';

/**
 * A data container for gene annotations originating from hammock files.
 * 
 * @author Daofeng Li, modified from Silas's Gene component
 */

export class RefGeneRecord extends React.Component {
    constructor(record){
        super();
        this.record = record;
    }
}


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
     * @param {RefGeneRecord} record - BedRecord-like object to use
     * @param {NavigationContext} navContext - used to calculate absolute coordinates
     * @param {FeatureInterval} featureInterval - a feature which overlaps this 
     */
    constructor(refGeneRecord, navContext, featureInterval) {
        
        const location = new ChromosomeInterval(refGeneRecord.chr, refGeneRecord.txStart, refGeneRecord.txEnd);
        super(null, location);

        const absInterval = navContext.convertGenomeIntervalToBases(featureInterval, location);
        if (!absInterval) {
            throw new RangeError("Cannot map this gene to the navigation context");
        }

        [this.absStart, this.absEnd] = absInterval;
        this._navContext = navContext;
        this._featureInterval = featureInterval;
        this.refGeneRecord = refGeneRecord;
    }

    /**
     * @inheritdoc
     */
    getName() {
        return this.refGeneRecord.name2 || this.refGeneRecord.name || "";
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
        const exonStartList = _.trim(exonStarts,',').split(',');
        const exonEndList = _.trim(exonEnds,',').split(',');
        if(cdsStart === cdsEnd){
            let tmp = [];
            for (const [idx, pos] of exonStartList){
                tmp.push([pos, exonEndList[idx]]);
            }
            details['thin'] = tmp;
            return details;
        }
        const thick = [], thin = [];
        for (const [idx, pos] of exonStartList){
            let start = pos, end = exonEndList[idx];
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
        return details;
        if (!this._details) {
            const details = this._details;

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
 * 
 * @author Silas Hsu
 */
export class GeneFormatter {
    /**
     * Turns BedRecords into Genes.  The second and third parameters exist to assist mapping to a navigation context.
     * Genes that fail mapping will be ignored and skipped.
     * 
     * @param {BedRecord[]} refGeneRecords - the records to convert
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

            }
        }
        return genes;
    }
}

export default Gene;
