import React from 'react';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import { scaleLinear, ScaleLinear } from 'd3-scale';
import { Arc } from './Arc';

import { FeaturePlacer, PlacedInteraction } from '../../model/FeaturePlacer';
import { GenomeInteraction } from '../../model/GenomeInteraction';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';

const HEIGHT_FACTOR = 0.35; // Max height of ribbons as a multiple of track width
const MIN_HEIGHT = 2;
const OPACITY = 0.3;
const SCORE_THRESHOLD = 4.2;

interface InteractionTrack3DProps {
    data: GenomeInteraction[];
    viewRegion: DisplayedRegionModel;
    width: number;
    depth: number;
}

// declare global {
//     namespace JSX {
//         interface IntrinsicElements {
//             'a-plane': any
//         }
//     }
// }

function isNonAdjacentBin(interaction: GenomeInteraction) {
    const binSize = interaction.locus1.getLength();
    const distance = Math.abs(interaction.locus1.start - interaction.locus2.start);
    return distance > binSize * 1.5;
}

export class InteractionTrack3D extends React.Component<InteractionTrack3DProps, {}> {
    public featurePlacer: FeaturePlacer;
    public arcWidthToHeight: ScaleLinear<number, number>;
    public standardizers: {[distance: number]: (x: number) => number};

    constructor(props: InteractionTrack3DProps) {
        super(props);
        this.featurePlacer = new FeaturePlacer();
        this.featurePlacer.placeInteractions = memoizeOne(this.featurePlacer.placeInteractions);
        this.arcWidthToHeight = null;
        this.renderOneInteraction = this.renderOneInteraction.bind(this);
    }

    renderOneInteraction(placement: PlacedInteraction, i: number): JSX.Element {
        // Center of the spans
        const startX = (placement.xSpan1.start + placement.xSpan1.end) / 2;
        const endX = (placement.xSpan2.start + placement.xSpan2.end) / 2;
        if (endX - startX <= 0) {
            return null;
        }
        const distance = placement.interaction.getDistance();
        const score = this.standardizers[distance] ? this.standardizers[distance](placement.interaction.score) : 0;
        if (Number.isNaN(score) || score < SCORE_THRESHOLD) {
            return null;
        }
        const height = this.arcWidthToHeight(placement.getWidth());
        const depth = this.props.depth;
        // const planeProps = {
        //     rotation: '-90 0 0',
        //     height: depth,
        //     color: '#B8008A',
        //     transparent: true,
        //     opacity: OPACITY,
        // };
        return <React.Fragment key={i}>
            <Arc startX={startX} endX={endX} height={height} depth={depth} z={-depth - 1} opacity={OPACITY} />;
            {/* <a-plane
                position={`${startX} 0 ${-depth/2 - 1}`}
                width={placement.xSpan1.getLength()}
                {...planeProps}
            />
            <a-plane
                position={`${endX} 0 ${-depth/2 - 1}`}
                width={placement.xSpan2.getLength()}
                {...planeProps}
            /> */}
        </React.Fragment>
    }

    render() {
        const {data, viewRegion, width} = this.props;
        if (data.length === 0) {
            return null;
        }
        const nonAdjacentData = data.filter(isNonAdjacentBin);
        const placedInteractions = this.featurePlacer.placeInteractions(nonAdjacentData, viewRegion, width);
        this.arcWidthToHeight = scaleLinear().domain([0, width]).range([MIN_HEIGHT, width * HEIGHT_FACTOR]);
        this.standardizers = new InteractionStatistics().makeStandardizersForDistances(nonAdjacentData);
        return placedInteractions.map(this.renderOneInteraction);
    }
}

class InteractionStatistics {
    makeStandardizer(mean: number, standardDev: number) {
        return (x: number) => (x - mean) / standardDev;
    } 

    makeStandardizersForDistances(interactions: GenomeInteraction[]) {
        const groupedByDistance = _.groupBy(interactions, interaction => interaction.getDistance());

        const standardizers: {[distance: number]: (x: number) => number} = {};
        for (const distance in groupedByDistance) {
            const interactionsForDistance = groupedByDistance[distance];
            const mean = _.meanBy(interactionsForDistance, 'score');
            const totalVariance = _.sum(interactionsForDistance.map(
                interaction => (interaction.score - mean) * (interaction.score - mean)
            ));
            const standardDev = Math.sqrt(totalVariance / (interactionsForDistance.length - 1));
            standardizers[Number(distance)] = this.makeStandardizer(mean, standardDev);
        }
        return standardizers;
    }
}
