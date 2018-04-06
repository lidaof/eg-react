/*
Example of a CytobandMap
{
    "chr1": [
        {
            "chrom": "chr1",
            "chromStart": 0,
            "chromEnd", 2300000,
            "name": "p36.33",
            "gieStain": "gneg"
        }
    ]
}
*/

/**
 * A dictionary/mapping type that maps from chromosome name to a list of all cytobands in that chromosome.
 */
interface CytobandMap {
    [chrName: string]: Cytoband[];
}

/**
 * A single cytoband record.
 */
interface Cytoband {
    chrom: string;
    chromStart: number;
    chromEnd: number;
    name: string;
    gieStain: string;
}

export default CytobandMap;
