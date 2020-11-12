/* eslint-disable @typescript-eslint/consistent-type-assertions */
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import { createPlugin, DefaultPluginSpec } from "molstar/lib/mol-plugin";
import { PluginContext } from "molstar/lib/mol-plugin/context";
import { AnimateUnitsExplode } from "molstar/lib/mol-plugin-state/animation/built-in";
import { PluginSpec } from "molstar/lib/mol-plugin/spec";
import { ObjectKeys } from "molstar/lib/mol-util/type-helpers";
import { PluginLayoutControlsDisplay } from "molstar/lib/mol-plugin/layout";
import { G3DFormat, G3dProvider, G3DHeaderFromUrl, G3DTrajectory } from "molstar/lib/extensions/g3d/format";
import { g3dHaplotypeQuery, G3dInfoDataProperty, g3dChromosomeQuery, g3dRegionQuery } from "molstar/lib/extensions/g3d/model";
import { StateTransforms } from "molstar/lib/mol-plugin-state/transforms";
import { createStructureRepresentationParams } from "molstar/lib/mol-plugin-state/helpers/structure-representation-params";
import { DataFormatProvider } from "molstar/lib/mol-plugin-state/formats/provider";
import { stringToWords } from "molstar/lib/mol-util/string";
import { PluginConfig } from "molstar/lib/mol-plugin/config";
import { DecorateResiduesWithAnnotations } from './MolstarColoring';
require("molstar/lib/mol-plugin-ui/skin/light.scss");

const CustomFormats = [["g3d", G3dProvider] as const];

const Extensions = {
    g3d: PluginSpec.Behavior(G3DFormat),
};

const DefaultViewerOptions = {
    customFormats: CustomFormats as [string, DataFormatProvider][],
    extensions: ObjectKeys(Extensions),
    layoutShowControls: true,
    layoutIsExpanded: false,
    layoutShowLeftPanel: true,
    layoutControlsDisplay: "reactive" as PluginLayoutControlsDisplay,
    layoutShowSequence: false,
    viewportShowExpand: false,
};
type ViewerOptions = typeof DefaultViewerOptions;
type InitParams = {
    url: string;
    resolution?: number;
};

class Molstar3D {
    plugin: PluginContext;
    components: any;
    chromVisualSelector: any;
    regionVisualSelector: any;

    constructor(target: HTMLElement, options: Partial<ViewerOptions> = {}) {
        const o = { ...DefaultViewerOptions, ...options };
        this.plugin = createPlugin(target, {
            ...DefaultPluginSpec,
            actions: [],
            layout: {
                initial: {
                    isExpanded: o.layoutIsExpanded,
                    showControls: o.layoutShowControls,
                    controlsDisplay: o.layoutControlsDisplay,
                },
                controls: {
                    ...(DefaultPluginSpec.layout && DefaultPluginSpec.layout.controls),
                    right: "none",
                    top: o.layoutShowSequence ? undefined : "none",
                    bottom: "none",
                    left: o.layoutShowLeftPanel ? undefined : "none",
                },
            },
            behaviors: [...DefaultPluginSpec.behaviors, ...o.extensions.map((e) => Extensions[e])],
            animations: [AnimateUnitsExplode],
            config: [[PluginConfig.Viewport.ShowExpand, o.viewportShowExpand]],
            components: {
                remoteState: "none",
            },
        });
        this.components= null;
    }

    async init(params: InitParams) {
        return this.plugin.dataTransaction(async () => {
            this.plugin.behaviors.layout.leftPanelTabName.next("data");
            this.plugin.representation.structure.themes.colorThemeRegistry.add(DecorateResiduesWithAnnotations.colorThemeProvider!);
            this.plugin.managers.lociLabels.addProvider(DecorateResiduesWithAnnotations.labelProvider!);
            this.plugin.customModelProperties.register(DecorateResiduesWithAnnotations.propertyProvider, true);
            const trajectory = await this.plugin
                .build()
                .toRoot()
                .apply(G3DHeaderFromUrl, { url: params.url })
                .apply(G3DTrajectory, { resolution: params.resolution })
                .commit();

            const builder = this.plugin.builders.structure;
            const model = await builder.createModel(trajectory);

            if (!model) return;
            const structure = await builder.createStructure(model);

            const info = G3dInfoDataProperty.get(model.data!);
            if (!info) return;

            this.components = this.plugin.build().to(structure);

            const repr = createStructureRepresentationParams(this.plugin, void 0, {
                type: 'cartoon',
                color: 'polymer-index',
                size: 'uniform',
                sizeParams: { value: 0.25 },
                typeParams: { alpha: 0.1 }
            });
        
            for (const h of info.haplotypes) {
                this.components
                    .apply(StateTransforms.Model.StructureSelectionFromExpression, { expression: g3dHaplotypeQuery(h), label: stringToWords(h) })
                    .apply(StateTransforms.Representation.StructureRepresentation3D, repr);
            }
        });
    }

    showChrom3dStruct = (chrom: string) => {
        // show struct of chromosome
        const reprChrom = createStructureRepresentationParams(this.plugin, void 0, {
            type: 'cartoon',
            color: 'polymer-index',
            size: 'uniform',
            sizeParams: { value: 0.25 },
            typeParams: { alpha: 0.2 }
        });
        this.chromVisualSelector = this.components.apply(StateTransforms.Model.StructureSelectionFromExpression, { expression: g3dChromosomeQuery(chrom), label: chrom })
            .apply(StateTransforms.Representation.StructureRepresentation3D, reprChrom).selector;
    }

    showRegion3dStruct = (chrom: string, start: number, end: number) => {
        // show struct of a particular region
        const reprRegion = createStructureRepresentationParams(this.plugin, void 0, {
            type: 'cartoon',
            color: 'polymer-index',
            size: 'uniform',
            sizeParams: { value: 0.25 },
            typeParams: { alpha: 1 }
        });
        this.regionVisualSelector = this.components.apply(StateTransforms.Model.StructureSelectionFromExpression, { expression: g3dRegionQuery(chrom, start, end), label: `${chrom}:${start}-${end}` })
            .apply(StateTransforms.Representation.StructureRepresentation3D, reprRegion).selector;
    }

    decorChrom3d = () => {
        const colorTheme = { name: DecorateResiduesWithAnnotations.propertyProvider.descriptor.name, params: this.plugin.representation.structure.themes.colorThemeRegistry.get(DecorateResiduesWithAnnotations.propertyProvider.descriptor.name).defaultValues };
        this.components.to(this.chromVisualSelector).update(StateTransforms.Representation.StructureRepresentation3D, (old:any) => ({ ...old, colorTheme }));
            
    }

    decorRegion3d = () => {
        console.log(DecorateResiduesWithAnnotations)
        const colorTheme = { name: DecorateResiduesWithAnnotations.propertyProvider.descriptor.name, params: this.plugin.representation.structure.themes.colorThemeRegistry.get(DecorateResiduesWithAnnotations.propertyProvider.descriptor.name).defaultValues };
        this.components.to(this.regionVisualSelector).update(StateTransforms.Representation.StructureRepresentation3D, (old:any) => ({ ...old, colorTheme }));
            
    }

    final = async () => {
        await this.components.commit();
    }
}

export default Molstar3D;
