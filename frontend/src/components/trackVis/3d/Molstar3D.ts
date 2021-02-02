/* eslint-disable @typescript-eslint/consistent-type-assertions */
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import { createPlugin, DefaultPluginSpec } from "molstar/lib/mol-plugin";
import { PluginContext } from "molstar/lib/mol-plugin/context";
import { AnimateUnitsExplode } from "molstar/lib/mol-plugin-state/animation/built-in/explode-units";
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
import { PluginCommands } from 'molstar/lib/mol-plugin/commands';
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

type GenomicRegion = {
    chrom: string,
    start: number,
    end: number,
}

class Molstar3D {
    plugin: PluginContext;
    chrom3dComponents: any;
    region3dComponents: any;
    chromSelectionSelectors: any;
    regionSelectionSelectors: any;
    structure: any;
    builder: any;
    model: any;
    trajectory: any;

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
        this.chromSelectionSelectors = [];
        this.regionSelectionSelectors = [];
    }

    async init(params: InitParams) {
        return this.plugin.dataTransaction(async () => {
            this.plugin.behaviors.layout.leftPanelTabName.next("data");
            this.plugin.representation.structure.themes.colorThemeRegistry.add(DecorateResiduesWithAnnotations.colorThemeProvider!);
            this.plugin.managers.lociLabels.addProvider(DecorateResiduesWithAnnotations.labelProvider!);
            this.plugin.customModelProperties.register(DecorateResiduesWithAnnotations.propertyProvider, true);
            this.trajectory = await this.plugin
                .build()
                .toRoot()
                .apply(G3DHeaderFromUrl, { url: params.url })
                .apply(G3DTrajectory, { resolution: params.resolution })
                .commit();

            this.builder = this.plugin.builders.structure;
            this.model = await this.builder.createModel(this.trajectory);

            if (!this.model) return;
            this.structure = await this.builder.createStructure(this.model);

            const info = G3dInfoDataProperty.get(this.model.data!);
            if (!info) return;

            const components = this.plugin.build().to(this.structure);

            const repr = createStructureRepresentationParams(this.plugin, void 0, {
                type: 'cartoon',
                color: 'polymer-index',
                size: 'uniform',
                sizeParams: { value: 0.25 },
                typeParams: { alpha: 0.1 }
            });
        
            for (const h of info.haplotypes) {
                components
                    .apply(StateTransforms.Model.StructureSelectionFromExpression, { expression: g3dHaplotypeQuery(h), label: stringToWords(h) })
                    .apply(StateTransforms.Representation.StructureRepresentation3D, repr);
            }
            await components.commit();
        });
    }

    /**
     * 
     * @param chroms chromosome name string
     * input a list of chrom names in case region spans more than 1 chrom
     */
    showChroms3dStruct = async (chroms: string[]) => {
        // show struct of chromosome
        const reprChrom = createStructureRepresentationParams(this.plugin, void 0, {
            type: 'cartoon',
            color: 'polymer-index',
            size: 'uniform',
            sizeParams: { value: 0.25 },
            typeParams: { alpha: 0.2 }
        });
        if(this.chromSelectionSelectors.length) {
            // remove first
            this.chromSelectionSelectors.forEach((selector: any) => PluginCommands.State.RemoveObject(this.plugin, {state: this.plugin.state.data, ref: selector}))
            this.chromSelectionSelectors = []
        }
        chroms.forEach(async chrom => {
            const components = this.plugin.build().to(this.structure);
            const chromSelection = components.apply(StateTransforms.Model.StructureSelectionFromExpression, { expression: g3dChromosomeQuery(chrom), label: chrom });
            this.chromSelectionSelectors.push(chromSelection.selector);
            chromSelection.apply(StateTransforms.Representation.StructureRepresentation3D, reprChrom);
            await components.commit();
        });
    }

    /**
     * 
     * @param regions GenomicRegion[]
     * when region spans more than 1 chrom, split to a list of regions
     */
    showRegions3dStruct = async (regions: GenomicRegion[]) => {
        // show struct of a particular region
        const reprRegion = createStructureRepresentationParams(this.plugin, void 0, {
            type: 'cartoon',
            color: 'polymer-index',
            size: 'uniform',
            sizeParams: { value: 0.25 },
            typeParams: { alpha: 1 }
        });
        if(this.regionSelectionSelectors.length) {
            // remove first
            this.regionSelectionSelectors.forEach((selector: any) => PluginCommands.State.RemoveObject(this.plugin, {state: this.plugin.state.data, ref: selector}))
            this.regionSelectionSelectors = []
        }
        regions.forEach(async region => {
            const components = this.plugin.build().to(this.structure);
            const regionSelection = components.apply(StateTransforms.Model.StructureSelectionFromExpression, { expression: g3dRegionQuery(region.chrom, region.start, region.end), label: `${region.chrom}:${region.start}-${region.end}` });
            this.regionSelectionSelectors.push(regionSelection.selector);
            regionSelection.apply(StateTransforms.Representation.StructureRepresentation3D, reprRegion);
            await components.commit();
        });
    }

    // decorChrom3d = () => {
    //     const colorTheme = { name: DecorateResiduesWithAnnotations.propertyProvider.descriptor.name, params: this.plugin.representation.structure.themes.colorThemeRegistry.get(DecorateResiduesWithAnnotations.propertyProvider.descriptor.name).defaultValues };
    //     this.components.to(this.chromVisualSelector).update(StateTransforms.Representation.StructureRepresentation3D, (old:any) => ({ ...old, colorTheme }));
            
    // }

    // decorRegion3d = () => {
    //     console.log(DecorateResiduesWithAnnotations)
    //     const colorTheme = { name: DecorateResiduesWithAnnotations.propertyProvider.descriptor.name, params: this.plugin.representation.structure.themes.colorThemeRegistry.get(DecorateResiduesWithAnnotations.propertyProvider.descriptor.name).defaultValues };
    //     this.components.to(this.regionVisualSelector).update(StateTransforms.Representation.StructureRepresentation3D, (old:any) => ({ ...old, colorTheme }));
            
    // }
}

export default Molstar3D;
