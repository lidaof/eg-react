/**
 * Utility functions that don't really fit in any particular folder.
 *
 * @author Silas Hsu
 */

import parseColor from "parse-color";
import _ from "lodash";
// import iwanthue from "iwanthue";
// import * as THREE from "three";
import rgba from "color-rgba";
import ChromosomeInterval from "model/interval/ChromosomeInterval";
import { AWS_API } from "dataSources/GeneSource";
import axios from "axios";

interface Coordinate {
    x: number;
    y: number;
}

/**
 * Button consts found in MouseEvents.  See https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
 */
export enum MouseButton {
    LEFT = 0,
    MIDDLE = 1,
    RIGHT = 2,
}

/**
 * Gets the x and y coordinates of a mouse event *relative to the top left corner of an element*.  By default, the
 * element is the event's `currentTarget`, the element to which the event listener has been attached.
 *
 * For example, if the top left corner of the element is at screen coordinates (10, 10) and the event's screen
 * coordinates are (11, 12), then this function will return `{x: 1, y: 2}`.
 *
 * @param {React.MouseEvent} event - the event for which to get relative coordinates
 * @param {Element} [relativeTo] - calculate coordinates relative to this element.  Default is event.currentTarget.
 * @return {Coordinate} object with props x and y that contain the relative coordinates
 */
export function getRelativeCoordinates(event: React.MouseEvent, relativeTo?: Element): Coordinate {
    if (!relativeTo) {
        relativeTo = event.currentTarget as Element;
    }
    const targetBoundingRect = relativeTo.getBoundingClientRect();
    return {
        x: event.clientX - targetBoundingRect.left,
        y: event.clientY - targetBoundingRect.top,
    };
}

/**
 * Given coordinates relative to the top left corner of an element, gets the page coordinates.
 *
 * @param {Element} relativeTo - element to use as reference point
 * @param {number} relativeX - x coordinates inside an element
 * @param {number} relativeY - y coordinates inside an element
 * @return {Coordinate} the page coordinates
 */
export function getPageCoordinates(relativeTo: Element, relativeX: number, relativeY: number): Coordinate {
    const targetBoundingRect = relativeTo.getBoundingClientRect();
    return {
        x: window.scrollX + targetBoundingRect.left + relativeX,
        y: window.scrollY + targetBoundingRect.top + relativeY,
    };
}

/**
 * Gets a color that contrasts well with the input color.  Useful for determining font color for a given background
 * color.  If parsing fails for the input color, returns black.
 *
 * Credit goes to https://stackoverflow.com/questions/1855884/determine-font-color-based-on-background-color
 *
 * @param {string} color - color for which to find a contrasting color
 * @return {string} a color that contrasts well with the input color
 */
export function getContrastingColor(color: string): string {
    const parsedColor = parseColor(color);
    if (!parsedColor.rgb) {
        return "black";
    }
    const [r, g, b] = parsedColor.rgb;
    const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    if (brightness < 0.5) {
        return "white";
    } else {
        return "black";
    }
}

/**
 * Returns a copy of the input list, ensuring its length is below `limit`.  If the list is too long, selects
 * equally-spaced elements from the original list.  Note that if the input is sorted, the output will be sorted as well.
 *
 * @param {T[]} list - list for which to ensure a max length
 * @param {number} limit - maximum length of the result list
 * @return {T[]} copy of list with max length ensured
 */
export function ensureMaxListLength<T>(list: T[], limit: number): T[] {
    if (list.length <= limit) {
        return list;
    }

    const selectedItems: T[] = [];
    for (let i = 0; i < limit; i++) {
        const fractionIterated = i / limit;
        const selectedIndex = Math.ceil(fractionIterated * list.length);
        selectedItems.push(list[selectedIndex]);
    }
    return selectedItems;
}

/**
 * @param {number} bases - number of bases
 * @return {string} human-readable string representing that number of bases
 */
export function niceBpCount(bases: number, useMinus = false) {
    const rounded = bases >= 1000 ? Math.floor(bases) : Math.round(bases);
    if (rounded >= 750000) {
        return `${(rounded / 1000000).toFixed(1)} Mb`;
    } else if (rounded >= 10000) {
        return `${(rounded / 1000).toFixed(1)} Kb`;
    } else if (rounded > 0) {
        return `${rounded} bp`;
    } else {
        if (useMinus) {
            return "<1 bp";
        } else {
            return "0 bp";
        }
    }
}

export function niceCount(bases: number) {
    const rounded = bases >= 1000 ? Math.floor(bases) : Math.round(bases);
    if (rounded >= 750000) {
        return `${rounded / 1000000}M`;
    } else if (rounded >= 1000) {
        return `${rounded / 1000}K`;
    }
    return `${bases}bp`;
}

export function ceil(value: number, precision: number) {
    const multiplier = Math.pow(10, precision || 0);
    return Math.ceil(value * multiplier) / multiplier;
}

export function readFileAsText(file: Blob) {
    const reader = new FileReader();
    const promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
    });
    reader.readAsText(file);
    return promise;
}

export function readFileAsBuffer(file: Blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const arrayBuffer = reader.result;
            const bytes = new Uint8Array(arrayBuffer as ArrayBuffer);
            resolve(bytes);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

/**
 * find closest number in a number array (sorted or un-sorted)
 */
export function findClosestNumber(arr: number[], num: number) {
    if (arr.includes(num)) {
        return num;
    }
    return arr.reduce((prev, curr) => {
        return Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev;
    });
}

export const HELP_LINKS = {
    datahub: "https://eg.readthedocs.io/en/latest/datahub.html",
    numerical: "https://eg.readthedocs.io/en/latest/tracks.html#numerical-tracks",
    tracks: "https://eg.readthedocs.io/en/latest/tracks.html",
    localhub: "https://eg.readthedocs.io/en/latest/local.html",
    trackOptions: "https://eg.readthedocs.io/en/latest/datahub.html#track-properties",
    textTrack: "https://eg.readthedocs.io/en/latest/text.html",
    publish: "https://eg.readthedocs.io/en/latest/faq.html#publish-with-the-browser",
    threed: "https://eg.readthedocs.io/en/latest/3d.html#supported-file-formats-for-3d-annotation-painting",
};

// /**
//  * react table column header filter, case insensitive
//  * https://github.com/tannerlinsley/react-table/issues/335
//  */
// export const filterCaseInsensitive = (filter:any, row:any) => {
//     const id = filter.pivotId || filter.id;
//     if (row[id] !== null && typeof row[id] === 'string') {
//         return (
//             row[id] !== undefined ?
//                 String(row[id].toLowerCase()).startsWith(filter.value.toLowerCase()) : true
//         )
//     }
//     else {
//         return (
//             String(row[filter.id]) === filter.value
//         )
//     }
// }

/**
 * calculate pearson correlation
 * from https://stackoverflow.com/questions/15886527/javascript-library-for-pearson-and-or-spearman-correlations#
 */

export const pcorr = (x: number[], y: number[]) => {
    let sumX = 0,
        sumY = 0,
        sumXY = 0,
        sumX2 = 0,
        sumY2 = 0;
    const minLength = (x.length = y.length = Math.min(x.length, y.length)),
        reduce = (xi: number, idx: number) => {
            const yi = y[idx];
            sumX += xi;
            sumY += yi;
            sumXY += xi * yi;
            sumX2 += xi * xi;
            sumY2 += yi * yi;
        };
    x.forEach(reduce);
    return (
        (minLength * sumXY - sumX * sumY) /
        Math.sqrt((minLength * sumX2 - sumX * sumX) * (minLength * sumY2 - sumY * sumY))
    );
};

/**
 *
 * @param current {string} current genome
 * @param tracks {trackModel[]} list of tracks
 */
export function getSecondaryGenomes(current: string, tracks: any[]) {
    const genomes: string[] = [];
    tracks.forEach((tk) => {
        if (tk.type === "genomealign") {
            if (tk.querygenome) {
                genomes.push(tk.querygenome);
            }
        }
        if (tk.metadata && tk.metadata.genome && tk.metadata.genome !== current) {
            genomes.push(tk.metadata.genome);
        }
    });
    return _.uniq(genomes);
}

export function variableIsObject(obj: any) {
    return obj !== null && obj !== undefined && obj.constructor.name === "Object";
}

// function reformatData(data: any) {
//     const grouped = _.groupBy(data, (x) => x[6]);
//     const sorted = {};
//     Object.keys(grouped).forEach((key) => {
//         const sort = grouped[key].sort((a, b) => a[0].localeCompare(b[0]) || a[1] - b[1]);
//         sorted[key] = sort;
//     });
//     return sorted;
// }

// export function getSplines(data: any) {
//     if (!data.length) {
//         console.error("error: data for splines is empty");
//         return null;
//     }
//     const splines = {};
//     const palette = iwanthue(data.length * 2);
//     data.forEach((dat: any, datIndex: number) => {
//         if (!dat) return;
//         const formatted = reformatData(dat.data);
//         Object.keys(formatted).forEach((key, keyIndex) => {
//             const tubeData = formatted[key];

//             const points = tubeData.map((item: any) => new THREE.Vector3(item[3], item[4], item[5]));
//             // console.log(points.length);
//             const spline = new THREE.CatmullRomCurve3(points);
//             const color = palette[datIndex + keyIndex];
//             splines[`${dat.region}_${key}`] = { spline, color };
//         });
//     });
//     return splines;
// }

// export function getTubeMesh(spline: any, color: any) {
//     const geometry = new THREE.TubeBufferGeometry(spline, 2000, 0.5, 8, false);
//     const material = new THREE.MeshBasicMaterial({ color });
//     const mesh = new THREE.Mesh(geometry, material);
//     return mesh;
// }

export function colorString2number(color: string): number {
    const [r, g, b] = rgba(color); //alpha not spreaded
    return (r << 16) + (g << 8) + b;
}

export function repeatArray(arr: any[], count: number): any[] {
    const ln = arr.length;
    const b = [];
    for (let i = 0; i < count; i++) {
        b.push(arr[i % ln]);
    }
    return b;
}

export function sameLoci(locus1: ChromosomeInterval, locus2: ChromosomeInterval) {
    return locus1.chr === locus2.chr && locus1.start === locus2.start && locus1.end === locus2.end;
}

export function arraysEqual(a: any[], b: any[]) {
    if (a === b) return true;
    if (a === null || b === null) return false;
    if (a.length !== b.length) return false;

    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.

    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

export const getSymbolRegions = async (genomeName: string, symbol: string) => {
    const params = {
        q: symbol,
        getOnlyNames: false,
    };
    const response = await axios.get(`${AWS_API}/${genomeName}/genes/queryName`, { params: params });
    return response.data;
};

export const safeParseJsonString = (str: string) => {
    try {
        return JSON.parse(str);
    } catch (e) {
        return str;
    }
};

// from https://stackoverflow.com/a/56156274/1098347
export const removeKey = (k = "", { [k]:_, ...o } = {} as any) => o

export const removeKeys = (keys:any[] = [], o = {}) => keys.reduce ((r, k) => removeKey (k, r), o)
