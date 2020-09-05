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
import { g3dHaplotypeQuery, getG3dInfoData } from "molstar/lib/extensions/g3d/model";
import { StateTransforms } from "molstar/lib/mol-plugin-state/transforms";
import { createStructureRepresentationParams } from "molstar/lib/mol-plugin-state/helpers/structure-representation-params";
import { DataFormatProvider } from "molstar/lib/mol-plugin-state/formats/provider";
import { stringToWords } from "molstar/lib/mol-util/string";
import { PluginConfig } from "molstar/lib/mol-plugin/config";
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
    }

    async init(params: InitParams) {
        return this.plugin.dataTransaction(async () => {
            this.plugin.behaviors.layout.leftPanelTabName.next("data");
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

            const info = getG3dInfoData(model.data!);
            if (!info) return;

            const components = this.plugin.build().to(structure);

            const repr = createStructureRepresentationParams(this.plugin, void 0, {
                type: "cartoon",
                color: "polymer-index",
                size: "uniform",
                sizeParams: { value: 0.25 },
                // typeParams: { alpha: 0.51 },
            });

            for (const h of info.haplotypes) {
                components
                    .apply(StateTransforms.Model.StructureSelectionFromExpression, {
                        expression: g3dHaplotypeQuery(h),
                        label: stringToWords(h),
                    })
                    .apply(StateTransforms.Representation.StructureRepresentation3D, repr);
            }

            await components.commit();
        });
    }
}

export default Molstar3D;
