import React from 'react';
import { ScaleLinear } from 'd3-scale';

import { GenomeInteraction } from '../../../model/GenomeInteraction';
import { PlacedInteraction } from '../../../model/FeaturePlacer';
import OpenInterval from '../../../model/interval/OpenInterval';

interface HeatmapProps {
    placedInteractions: PlacedInteraction[];
    viewWindow: OpenInterval;
    width: number;
    opacityScale: ScaleLinear<number, number>;
    color: string;
    onInteractionHovered(event: React.MouseEvent, interaction: GenomeInteraction): void;
    onMouseOut(event: React.MouseEvent): void;
}

export class Heatmap extends React.PureComponent<HeatmapProps, {}> {
    render() {
        const {placedInteractions, viewWindow, width, opacityScale, color, onInteractionHovered,
            onMouseOut} = this.props;
        const diamonds = [];
        for (const placedInteraction of placedInteractions) {
            const score = placedInteraction.interaction.score;
            if (!score) {
                continue;
            }

            const xSpan1 = placedInteraction.xLocation1;
            const xSpan2 = placedInteraction.xLocation2;
            const gapCenter = (xSpan1.end + xSpan2.start) / 2;
            const gapLength = xSpan2.start - xSpan1.end;
            const topX = gapCenter;
            const topY = 0.5 * gapLength;
            const halfSpan1 = 0.5 * xSpan1.getLength();
            const halfSpan2 = 0.5 * xSpan2.getLength();
            const points = [ // Going counterclockwise
                [topX, topY], // Top
                [topX - halfSpan1, topY + halfSpan1], // Left
                [topX - halfSpan1 + halfSpan2, topY + halfSpan1 + halfSpan2], // Bottom = left + halfSpan2
                [topX + halfSpan2, topY + halfSpan2] // Right
            ];
            diamonds.push(<polygon
                key={placedInteraction.generateKey()}
                points={points as any} // React can convert the array to a string
                fill={color}
                opacity={opacityScale(score)}
                onMouseMove={event => onInteractionHovered(event, placedInteraction.interaction)} // tslint:disable-line
            />);
        }
        return <svg width={width} height={0.5 * viewWindow.getLength()} onMouseOut={onMouseOut} >{diamonds}</svg>;
    }
}
