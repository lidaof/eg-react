// /**
//  * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
//  *
//  * @author David Sehnal <david.sehnal@gmail.com>
//  * @author Alexander Rose <alexander.rose@weirdbyte.de>
//  */

// import { CustomElementProperty } from 'molstar/lib/mol-model-props/common/custom-element-property';
// import { Model, ElementIndex } from 'molstar/lib/mol-model/structure';
// import { Color } from 'molstar/lib/mol-util/color';
// import { G3dInfoDataProperty } from 'molstar/lib/extensions/g3d/model';

// export const DecorateResiduesWithAnnotations = CustomElementProperty.create<number>({
//     label: 'Decorate Residue With Annotations',
//     name: 'decorate-residue-with-annotations',
//     getData(model: Model) {
//         const map = new Map<ElementIndex, number>();
//         const info = (G3dInfoDataProperty as any).get(model);
//         console.log(info);
//         for (let i = 0, _i = info.start.length; i < _i; i++) {
//             map.set(i as ElementIndex, i % 2);
//         }
//         return { value: map };
//     },
//     coloring: {
//         getColor(e) { return e === 0 ? Color(0xff0000) : Color(0x0000ff); },
//         defaultColor: Color(0x777777)
//     },
//     getLabel(e) {
//         return e === 0 ? 'Compartment A' : 'Compartment B';
//     }
// });
