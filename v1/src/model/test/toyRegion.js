import DisplayedRegionModel from '../DisplayedRegionModel';
import NavigationContext from '../NavigationContext';
import Feature from '../Feature';
import ChromosomeInterval from '../interval/ChromosomeInterval';

export const CHROMOSOMES = [
    new Feature("chr1", new ChromosomeInterval("chr1", 0, 10)),
    new Feature("chr2", new ChromosomeInterval("chr2", 0, 10)),
    new Feature("chr3", new ChromosomeInterval("chr3", 0, 10)),
];

/**
 * Makes an instance of DisplayedRegionModel for testing purposes.  The genome will have 3 chromosomes, each with a
 * length of 10 bases.  Default region is [0, 10).
 * 
 * @param {number} [start] - initial absolute start of the region, inclusive.  Default: 0
 * @param {number} [end] - initial absolute end of the region, exclusive.  Default: 10
 * @return {DisplayedRegionModel} an instance for testing purposes
 */
export function makeToyRegion(start=0, end=10) {
    const navContext = new NavigationContext("Wow very genome", CHROMOSOMES);
    let model = new DisplayedRegionModel(navContext);
    model.setRegion(start, end);
    return model;
}

export default makeToyRegion;
