import React from 'react';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import { FeaturePlacer, PlacedInteraction } from '../../model/FeaturePlacer';
import { GenomeInteraction } from '../../model/GenomeInteraction';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import { scaleLinear, ScaleLinear, scaleLog, ScaleLogarithmic } from 'd3-scale';
import { Arc } from './Arc';

const HEIGHT_FACTOR = 0.5; // Max height of ribbons as a multiple of track width
const MIN_HEIGHT = 2;
const ARCS_TO_DRAW = 100;

interface InteractionTrack3DProps {
    data: GenomeInteraction[];
    viewRegion: DisplayedRegionModel;
    width: number;
    depth: number;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'a-plane': any
        }
    }
}

function isNonAdjacentBin(interaction: GenomeInteraction) {
    const binSize = interaction.locus1.getLength();
    const distance = Math.abs(interaction.locus1.start - interaction.locus2.start);
    return distance > binSize * 1.5;
}

export class InteractionTrack3D extends React.Component<InteractionTrack3DProps, {}> {
    public featurePlacer: FeaturePlacer;
    public arcWidthToHeight: ScaleLinear<number, number>;
    public scoreToOpacity: ScaleLogarithmic<number, number>;

    constructor(props: InteractionTrack3DProps) {
        super(props);
        this.featurePlacer = new FeaturePlacer();
        this.featurePlacer.placeInteractions = memoizeOne(this.featurePlacer.placeInteractions);
        this.arcWidthToHeight = null;
        this.renderOneInteraction = this.renderOneInteraction.bind(this);
    }

    renderOneInteraction(placement: PlacedInteraction, i: number): JSX.Element {
        // Center of the spans
        const startX = (placement.xLocation1.start + placement.xLocation1.end) / 2;
        const endX = (placement.xLocation2.start + placement.xLocation2.end) / 2;
        if (endX - startX <= 0) {
            return null;
        }
        const height = this.arcWidthToHeight(placement.getWidth());
        const depth = this.props.depth;
        const opacity = this.scoreToOpacity(placement.interaction.score + 1);
        const planeProps = {
            rotation: '-90 0 0',
            height: depth,
            color: '#B8008A',
            transparent: true,
            opacity,
        };
        return <React.Fragment key={i}>
            <Arc startX={startX} endX={endX} height={height} depth={depth} z={-depth - 1} opacity={opacity} />;
            <a-plane
                position={`${startX} 0 ${-depth/2 - 1}`}
                width={placement.xLocation1.getLength()}
                {...planeProps}
            />
            <a-plane
                position={`${endX} 0 ${-depth/2 - 1}`}
                width={placement.xLocation2.getLength()}
                {...planeProps}
            />
        </React.Fragment>
    }

    render() {
        const {data, viewRegion, width} = this.props;
        if (data.length === 0) {
            return null;
        }
        const nonAdjacentData = data.filter(isNonAdjacentBin);
        const sampledData = _.sampleSize(nonAdjacentData, ARCS_TO_DRAW);
        const placedInteractions = this.featurePlacer.placeInteractions(sampledData, viewRegion, width);
        const dataMax = _.maxBy(placedInteractions, placement => placement.interaction.score).interaction.score;
        this.arcWidthToHeight = scaleLinear().domain([0, width]).range([MIN_HEIGHT, width * HEIGHT_FACTOR]);
        this.scoreToOpacity = scaleLog().domain([1, dataMax + 1]).range([0, 0.9]);
        return placedInteractions.map(this.renderOneInteraction);
    }
}
