import DisplayedRegionModel from '../DisplayedRegionModel'

export const CHROMOSOMES = [
    {
        name: "chr1",
        lengthInBases: 10,
    },
    {
        name: "chr2",
        lengthInBases: 10,
    },
    {
        name: "chr3",
        lengthInBases: 10,
    },
];

/**
 * Makes an instance of DisplayedRegionModel for testing purposes.  The genome will have 3 chromosomes, each with a
 * length of 10 bases.
 * 
 * @param {number} [start] - initial absolute start of the region, inclusive.  Default: 0
 * @param {number} [end] - initial absolute end of the region, exclusive.  Default: 10
 * @return {DisplayedRegionModel} an instance for testing purposes
 */
export function makeToyRegion(start=0, end=10) {
    let model = new DisplayedRegionModel("Wow very genome", CHROMOSOMES);
    model.setRegion(start, end);
    return model;
}

export default makeToyRegion;
