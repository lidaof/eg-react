/**
 * implementing UCSC like binning schema in JS
 * check http://genomewiki.ucsc.edu/index.php/Bin_indexing_system
 * modified from tabix C code
 * @author: Daofeng Li
 */

import _ from "lodash";

function* xrange(start, stop, step) {
    if (stop === undefined) {
        stop = start;
        start = 0;
    }

    if (step === undefined) {
        step = 1;
    }

    for (let i = start; start < stop ? i < stop : i > stop; i += step) {
        yield i;
    }
}

/**
 *convert region to bin
 *
 * @export
 * @param {*} beg
 * @param {*} end
 * @returns
 */
export function reg2bin(beg, end) {
    if (Number.isNaN(beg) || Number.isNaN(end)) {
        console.error("beg and end must be numbers");
        return 0;
    }
    end -= 1;
    if (beg >> 14 === end >> 14) {
        return 4681 + (beg >> 14);
    }
    if (beg >> 17 === end >> 17) {
        return 585 + (beg >> 17);
    }
    if (beg >> 20 === end >> 20) {
        return 73 + (beg >> 20);
    }
    if (beg >> 23 === end >> 23) {
        return 9 + (beg >> 23);
    }
    if (beg >> 26 === end >> 26) {
        return 1 + (beg >> 26);
    }
    return 0;
}

/**
 *convert region to bins
 *
 * @export
 * @param {*} beg
 * @param {*} end
 * @returns
 */
export function reg2bins(beg, end) {
    if (Number.isNaN(beg) || Number.isNaN(end)) {
        console.error("beg and end must be numbers");
        return;
    }
    let lst = [];
    lst.push(0);
    if (beg >= end) {
        return lst;
    }
    if (end >= 1 << 29) {
        end = 1 << 29;
    }
    end -= 1;
    for (let k of xrange(1 + (beg >> 26), 1 + (end >> 26) + 1)) {
        lst.push(k);
    }
    for (let k of xrange(9 + (beg >> 23), 9 + (end >> 23) + 1)) {
        lst.push(k);
    }
    for (let k of xrange(73 + (beg >> 20), 73 + (end >> 20) + 1)) {
        lst.push(k);
    }
    for (let k of xrange(585 + (beg >> 17), 585 + (end >> 17) + 1)) {
        lst.push(k);
    }
    for (let k of xrange(4681 + (beg >> 14), 4681 + (end >> 14) + 1)) {
        lst.push(k);
    }
    return lst;
}

function overlapHalf(s1, e1, start, end) {
    return (Math.min(e1, end) - Math.max(s1, start)) / (e1 - s1) >= 0.5;
}

// function justOverlap(s1, e1, start, end) {
//     return Math.min(e1, end) - Math.max(s1, start) > 0;
// }

// function overlapBase(s1, e1, start, end) {
//     return Math.min(e1, end) - Math.max(s1, start);
// }

/**
 * find atoms based on give region, since there are different haplotyps, so return an array instead, just return the first one in each hap
 *
 * @param {*} keeper
 * @param {*} chr
 * @param {*} start
 * @param {*} end
 */
export function findAtomsWithRegion(keeper, chr, start, end, resolution, displayedModelKeys) {
    const atoms = [];
    displayedModelKeys.forEach((hap) => {
        if (keeper[hap].hasOwnProperty(chr)) {
            const binkeys = reg2bins(start, end).map((k) => k.toString());
            let found = false,
                i,
                j;
            for (i = 0; i < binkeys.length; i++) {
                if (keeper[hap][chr].hasOwnProperty(binkeys[i])) {
                    for (j = 0; j < keeper[hap][chr][binkeys[i]].length; j++) {
                        const center = 0.5 * (start + end);
                        if (
                            center >= keeper[hap][chr][binkeys[i]][j].properties.start &&
                            center <= keeper[hap][chr][binkeys[i]][j].properties.start + resolution
                        ) {
                            atoms.push(keeper[hap][chr][binkeys[i]][j]);
                            found = true;
                            break;
                        }
                    }
                }
                if (found) {
                    break;
                }
            }
        }
    });
    return atoms;
}

export function getBigwigValueForAtom(keepers, atom, resolution) {
    // console.log(keepers, atom);
    const values = [];
    const binkeys = reg2bins(atom.properties.start, atom.properties.start + resolution).map((k) => k.toString());
    // console.log(binkeys);
    binkeys.forEach((binkey) => {
        if (keepers.hasOwnProperty(atom.chain)) {
            if (keepers[atom.chain].hasOwnProperty(binkey)) {
                keepers[atom.chain][binkey].forEach((item) => {
                    //center not looking good, many data missing
                    // if (item.start >= atom.properties.start && item.end <= atom.properties.start + resolution) {
                    if (overlapHalf(item.start, item.end, atom.properties.start, atom.properties.start + resolution)) {
                        values.push(item.score);
                    }
                });
            }
        }
    });
    // console.log(values);
    return values.length ? _.mean(values) : undefined;
}

export function getCompartmentNameForAtom(keepers, atom, resolution) {
    // console.log(keepers, atom);
    if (!keepers.hasOwnProperty(atom.chain)) {
        return undefined;
    }
    const binkeys = reg2bins(atom.properties.start, atom.properties.start + resolution).map((k) => k.toString());
    for (let i = 0; i < binkeys.length; i++) {
        const items = keepers[atom.chain][binkeys[i]];
        if (items && items.length) {
            for (let j = 0; j < items.length; j++) {
                // if (justOverlap(items[j].start, items[j].end, atom.properties.start, atom.properties.end)) {
                if (atom.properties.start >= items[j].start && items[j].end >= atom.properties.start) {
                    return items[j].name;
                }
            }
        }
    }
    return undefined;
}

export function atomInFilterRegions(atom, filterRegions) {
    const chroms = Object.keys(filterRegions);
    let inRegion = false;
    if (!chroms.includes(atom.chain)) {
        return inRegion;
    }
    // chroms.every((chrom) => {
    //     return filterRegions[chrom].every((r) => {
    //         if (atom.chain === chrom && atom.properties.start >= r[0] && atom.properties.start <= r[1]) {
    //             inRegion = true;
    //             return false;
    //         }
    //         return true;
    //     });
    // });
    let i, j;
    for (i = 0; i < chroms.length; i++) {
        for (j = 0; j < filterRegions[chroms[i]].length; j++) {
            if (
                atom.chain === chroms[i] &&
                atom.properties.start >= filterRegions[chroms[i]][j][0] &&
                atom.properties.start <= filterRegions[chroms[i]][j][1]
            ) {
                inRegion = true;
                break;
            }
        }
        if (inRegion) {
            break;
        }
    }
    return inRegion;
}
