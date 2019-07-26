import React from 'react';
import _ from 'lodash';
import { scaleLinear } from 'd3-scale';
import memoizeOne from 'memoize-one';
import parseColor from 'parse-color';

import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import { NumericalFeature } from '../../model/Feature';
import { FeatureAggregator, DefaultAggregators } from '../../model/FeatureAggregator';
import { Custom3DObject } from './Custom3DObject';
import { mergeGeometries } from './mergeGeometries';

interface NumericalTrack3DProps {
    data: NumericalFeature[];
    viewRegion: DisplayedRegionModel;
    width: number;
    height: number;
    z: number;
    options: {
        color: string;
    };
}

const NUM_BOXES = 1000;
const MIN_BOX_HEIGHT = 0.05; // Meters

/**
 * Makes a lighter version of the input color.
 * 
 * @param {string} color - color for which to make a lighter version
 * @param {number} howMuchLighter - how much lighter to make the color
 * @return {string} a lighter version of the input color
 */
function makeTint(color: string, howMuchLighter=50) {
    const parsed = parseColor(color);
    if (!parsed.rgb) {
        return 'black';
    }

    const [r, g, b] = parsed.rgb.map(channel => Math.min(channel + howMuchLighter, 255));
    return `rgb(${r}, ${g}, ${b})`;
}

export class NumericalTrack3D extends React.Component<NumericalTrack3DProps, {}> {
    constructor(props: NumericalTrack3DProps) {
        super(props);
        this.aggregateFeatures = memoizeOne(this.aggregateFeatures);
        this.generateBoxes = memoizeOne(this.generateBoxes);
    }

    aggregateFeatures(data: NumericalFeature[], viewRegion: DisplayedRegionModel): number[] {
        const aggregator = new FeatureAggregator();
        const xToFeatures = aggregator.makeXMap(data, viewRegion, NUM_BOXES);
        return xToFeatures.map( DefaultAggregators.fromId(DefaultAggregators.types.MEAN) );
    }

    generateBoxes(boxToValue: number[]): any {
        const {width, height, z, options} = this.props;
        const min = _.min(boxToValue); // Returns undefined if no data.  This will cause scales to return NaN.
        const max = _.max(boxToValue);
        const valueToHeight = scaleLinear().domain([min, max]).range([0, height]).clamp(true);

        const THREE = (window as any).THREE;
        const boxWidth = width / NUM_BOXES;
        const geometries = [];
        for (let i = 0; i < boxToValue.length; i++) {
            const height = valueToHeight(boxToValue[i])
            if (Number.isNaN(height) || height < MIN_BOX_HEIGHT) {
                continue;
            }
            const x = i * boxWidth;
            const y = height/2;

            const boxGeometry = new THREE.BoxBufferGeometry(boxWidth, height, 0.05);
            boxGeometry.translate(x, y, z);
            geometries.push(boxGeometry);
        }
        const mergedGeometry = mergeGeometries(geometries);

        const MAIN_MATERIAL = new THREE.MeshBasicMaterial({color: options.color || "blue"});
        const WIREFRAME_MATERIAL = new THREE.MeshBasicMaterial({
            color: makeTint(options.color || "blue"),
            wireframe: true
        });

        const boxes = new THREE.Mesh(mergedGeometry, MAIN_MATERIAL);
        const wireframe = new THREE.Mesh(mergedGeometry, WIREFRAME_MATERIAL);
        const group = new THREE.Group();
        group.add(boxes);
        group.add(wireframe);
        return group;
    }

    render() {
        const {data, viewRegion} = this.props;
        const boxToValue = this.aggregateFeatures(data, viewRegion);
        return <Custom3DObject object={this.generateBoxes(boxToValue)} position={"0 0 -0.2"} />;
    }
}
