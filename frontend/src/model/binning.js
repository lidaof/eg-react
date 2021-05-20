/**
 * implementing UCSC like binning schema in JS
 * check http://genomewiki.ucsc.edu/index.php/Bin_indexing_system
 * modified from tabix C code
 * @author: Daofeng Li
 */

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

/**
 * atoms with hover event added
 * add click event instead, hover seems slow
 * @param {*} atoms2
 */
// assginAtomsCallbacks = (atoms2) => {
//     const atoms = {};
//     const chroms = this.viewRegionToChroms();
//     Object.keys(atoms2).forEach((hap) => {
//         const addevents = atoms2[hap].map((atom2) => {
//             // mouse over and click handler
//             const atom = Object.assign({}, atom2);
//             // atom.hoverable = true;
//             // let oldStyle;
//             // atom.hover_callback = (at) => {
//             //     // console.log('hover', at.resi)
//             //     this.setState({ hoveringAtom: at });
//             //     oldStyle = { ...at.style };
//             //     // console.log(oldStyle)
//             //     // this.viewer.setStyle({resi: at.resi}, {sphere: {color: 'pink', opacity: 1, radius: 2}});
//             //     // this.viewer.setStyle({resi: at.resi}, {cross: {color: 'pink', opacity: 1, radius: 2}});
//             //     this.viewer.setStyle(
//             //         { resi: [`${at.resi}-${at.resi + 1}`] },
//             //         { cartoon: { color: "#ff3399", style: "trace", thickness: 1 } }
//             //     );
//             //     this.viewer.render();
//             // };
//             // atom.unhover_callback = (at) => {
//             //     // console.log('unhover', at);
//             //     this.setState({ hoveringAtom: null });
//             //     this.viewer.setStyle({ resi: [`${at.resi}-${at.resi + 1}`] }, oldStyle);
//             //     this.viewer.render();
//             // };
//             if (chroms.includes(atom.chain)) {
//                 atom.clickable = true;
//                 atom.callback = (at) => {
//                     // at.color = 0x0000ff;
//                     // at.style= {cartoon: {color: '#ff3399', style: 'trace', thickness: 1}}
//                     // console.log("clicked", at, this.viewer.modelToScreen(at));

//                 };
//             }
//             return atom;
//         });
//         atoms[hap] = addevents;
//     });
//     return atoms;
// };

// clearMainScene = () => {
//     this.viewer.clear();
//     this.model = {};
// };

// updateMainViewerClickable = () => {
//     const { resolution } = this.state;
//     const resString = resolution.toString();
//     const atoms = this.assginAtomsCallbacks(this.atomData[resString][0]);
//     this.atomData[resString][1] = atoms;
// };

// updateMainViewer = () => {
//     this.clearMainScene();
//     const { resolution } = this.state;
//     const resString = resolution.toString();
//     const atoms = this.atomData[resString][1];
//     Object.keys(atoms).forEach((hap) => {
//         this.model[hap] = this.viewer.addModel();
//         this.model[hap].addAtoms(atoms[hap]);
//     });
//     this.viewer.setStyle({}, { line: { colorscheme: "chrom", opacity: 0.3 } });
//     this.viewer.zoomTo();
//     this.viewer.render();
// };
