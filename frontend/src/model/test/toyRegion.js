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
 * length of 10 bases.  Start and end parameters will be passed to the DisplayedRegionModel constructor.
 * 
 * @param {number} [start] - initial start of the region, inclusive.
 * @param {number} [end] - initial end of the region, exclusive.
 * @return {DisplayedRegionModel} an instance for testing purposes
 */
export function makeToyRegion(start, end) {
    const navContext = new NavigationContext("Wow very genome", CHROMOSOMES);
    let model = new DisplayedRegionModel(navContext, start, end);
    return model;
}

export default makeToyRegion;
