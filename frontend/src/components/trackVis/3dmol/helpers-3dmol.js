import colorParse from "color-parse";

export const CYTOBAND_COLORS_SIMPLE = {
    gneg: "white",
    gpos: "rgb(180,180,180)",
    gpos25: "rgb(180,180,180)",
    gpos50: "rgb(120,120,120)",
    gpos75: "rgb(60,60,60)",
    gpos100: "rgb(0,0,0)",
    gvar: "rgb(0,0,0)",
    stalk: "rgb(180,180,180)",
    gpos33: "rgb(142,142,142)",
    gpos66: "rgb(57,57,57)",
    acen: "rgb(141,64,52)", // Centromere
};

const resnList = [
    "GLN",
    "THR",
    "SER",
    "VAL",
    "PRO",
    "LYS",
    "ILE",
    "LEU",
    "ARG",
    "GLY",
    "CYS",
    "ASP",
    "GLU",
    "ASN",
    "TYR",
    "MET",
    "ALA",
    "PHE",
    "TRP",
    "HIS",
];

const getScale3d = (num) => {
    const mag = Math.floor(Math.log10(num));
    return 10 ** (mag - 1);
};

export const g3dParser = function (data, clickCallback) {
    /**
     * the .g3d parser for 3dmol.js input, following .xyz example
     */
    // const atoms = []; //array of models, maybe for different haplotypes, or cells/clusters for single cell data
    const atoms = {}; // hap as key, atom array as value
    // const p = [new window.$3Dmol.Vector3(), new window.$3Dmol.Vector3(), new window.$3Dmol.Vector3()];

    for (const hap of Object.keys(data)) {
        const hapAtoms = [];
        let bi = 0; // bond index
        for (const chr of Object.keys(data[hap])) {
            let ri = 0;
            let x = data[hap][chr].x[0];
            let y = data[hap][chr].y[0];
            let z = data[hap][chr].z[0];
            const maxXYZ = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
            const scale = getScale3d(maxXYZ);
            x /= scale;
            y /= scale;
            z /= scale;
            // p[0].set(x, y, z);
            // p[2].set(x, y, z);
            for (let i = 0; i < data[hap][chr].start.length; i++) {
                bi += 1;
                ri += 1;
                const atom = {};
                const start = data[hap][chr].start[i];
                x = data[hap][chr].x[i] / scale;
                y = data[hap][chr].y[i] / scale;
                z = data[hap][chr].z[i] / scale;
                // p[1].set(x, y, z);
                // if (i + 1 < data[hap][chr].start.length)
                //     p[2].set(data[hap][chr].x[i + 1], data[hap][chr].y[i + 1], data[hap][chr].z[i + 1]);
                // else p[2].set(x, y, z);
                atom.x = x;
                atom.y = y;
                atom.z = z;
                // const r = (2 / 3) * Math.min(p[0].distanceTo(p[1]), p[2].distanceTo(p[1]));
                atom.resi = ri;
                atom.resn = resnList[i % resnList.length];
                atom.atom = "CA";
                atom.elem = "C";
                atom.chain = chr;
                atom.serial = bi;
                atom.b = 1.0;
                atom.hetflag = false;
                atom.properties = {};
                if (i === 0) {
                    atom.bonds = [bi];
                    atom.bondOrder = [1];
                } else if (i === data[hap][chr].start.length - 1) {
                    atom.bonds = [bi - 2];
                    atom.bondOrder = [1];
                } else {
                    atom.bonds = [bi - 2, bi];
                    atom.bondOrder = [1, 1];
                }

                //   atom.properties.value = Math.floor(Math.random() * 201) - 100; // random value for test color assignment
                //   atom.properties.chrom = chr;
                atom.properties.start = start;
                // atom.properties.radius = r;
                atom.properties.hap = hap;

                if (clickCallback) {
                    atom.clickable = true;
                    atom.callback = (at) => {
                        clickCallback(at);
                    };
                }

                hapAtoms.push(atom);

                // const _p = p[0];
                // p[0] = p[1];
                // p[1] = _p;
            }
            if (data[hap][chr].start.length === 1) {
                hapAtoms[0].properties.radius = 1;
            }
        }
        //   atoms.push(hapAtoms);
        atoms[hap] = hapAtoms;
    }
    // console.log(atoms)
    return atoms;
};

export const chromColors = {
    chr1: 0xc0d0ff,
    chr2: 0xb0ffb0,
    chr3: 0xffc0c8,
    chr4: 0xffff80,
    chr5: 0xffc0ff,
    chr6: 0xb0f0f0,
    chr7: 0xffd070,
    chr8: 0xf08080,
    chr9: 0xf5deb3,
    chr10: 0x00bfff,
    chr11: 0xcd5c5c,
    chr12: 0x66cdaa,
    chr13: 0x9acd32,
    chr14: 0xee82ee,
    chr15: 0x00ced1,
    chr16: 0x00ff7f,
    chr17: 0x3cb371,
    chr18: 0x00008b,
    chr19: 0xbdb76b,
    chr20: 0x006400,
    chr21: 0x800000,
    chr22: 0x808000,
    chr23: 0x800080,
    chrX: 0x008080,
    chrY: 0xb8860b,
    chrM: 0xb22222,
};
/**
 * binary search from https://stackoverflow.com/questions/4431259/formal-way-of-getting-closest-values-in-array-in-javascript-given-a-value-and-a/4431347
 *
 * @param {*} a: data array
 * @param {*} x: number to be search
 */
export const getClosestValueIndex = (a, x) => {
    if (!a) {
        return [undefined, undefined];
    }
    if (!a.length) {
        return [undefined, undefined];
    }
    let lo = -1,
        hi = a.length;
    if (x < a[0]) {
        lo = 0;
    }
    if (x > a[a.length - 1]) {
        hi = a.length;
    }
    while (hi - lo > 1) {
        let mid = Math.round((lo + hi) / 2);
        if (a[mid] <= x) {
            lo = mid;
        } else {
            hi = mid;
        }
    }
    if (a[lo] === x) {
        hi = lo;
    }
    // return [a[lo], a[hi]];
    return [lo, hi]; // lower index, higher index
};

/**
 *
 * @param {*} color as number
 * from https://bytes.com/topic/javascript/insights/636088-function-convert-decimal-color-number-into-html-hex-color-string
 */
export function decimalColorToHTMLcolor(number) {
    //converts to a integer
    var intnumber = number - 0;

    // isolate the colors - really not necessary
    var red, green, blue;

    // needed since toString does not zero fill on left
    var template = "#000000";

    // in the MS Windows world RGB colors
    // are 0xBBGGRR because of the way Intel chips store bytes
    red = (intnumber & 0x0000ff) << 16;
    green = intnumber & 0x00ff00;
    blue = (intnumber & 0xff0000) >>> 16;

    // mask out each color and reverse the order
    intnumber = red | green | blue;

    // toString converts a number to a hexstring
    var HTMLcolor = intnumber.toString(16);

    //template adds # for standard HTML #RRGGBB
    HTMLcolor = template.substring(0, 7 - HTMLcolor.length) + HTMLcolor;

    return HTMLcolor;
}

export function rgb_to_hex(red, green, blue) {
    const rgb = (red << 16) | (green << 8) | (blue << 0);
    return "#" + (0x1000000 + rgb).toString(16).slice(1);
}

/**
 * 
 * @param {*} colorstr 
 * 
 * > parse('#ff0000')
{ space: 'rgb', values: [ 255, 0, 0 ], alpha: 1 }
> parse('rgb(255, 247, 0)')
{ space: 'rgb', values: [ 255, 247, 0 ], alpha: 1 }
> 

 */
export const colorAsNumber = (colorstr) => {
    const p = colorParse(colorstr);
    return (p.values[0] << 16) | (p.values[1] << 8) | (p.values[2] << 0);
};
