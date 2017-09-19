import DisplayedRegionModel from './DisplayedRegionModel'

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
 * Makes an instance of DisplayedRegionModel for testing purposes.
 * 
 * @param {number} - initial absolute start of the region
 * @param {number} - initial absolute end of the region
 * @return {DisplayedRegionModel} an instance for testing purposes
 */
export function makeToyRegion(start=0, end=10) {
    let model = new DisplayedRegionModel("Wow very genome", CHROMOSOMES);
    model.setRegion(start, end);
    return model;
}

export default makeToyRegion;
