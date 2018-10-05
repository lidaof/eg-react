import React from 'react';
import { ScaleLinear, scaleLinear } from 'd3-scale';
import { PlacedInteraction } from '../../../model/FeaturePlacer';
import OpenInterval from '../../../model/interval/OpenInterval';
import { GenomeInteraction } from '../../../model/GenomeInteraction';
import _ from 'lodash';

import './ArcDisplay.css';

interface ArcDisplayProps {
    placedInteractions: PlacedInteraction[];
    viewWindow: OpenInterval;
    width: number;
    opacityScale: ScaleLinear<number, number>;
    color: string;
    onInteractionHovered(event: React.MouseEvent, interaction: GenomeInteraction): void;
    onMouseOut(event: React.MouseEvent): void;
}

const HEIGHT = 500;
const STROKE_WIDTH = 2;
const ITEM_LIMIT = 1000;

export class ArcDisplay extends React.PureComponent<ArcDisplayProps, {}> {
    static getHeight(props: ArcDisplayProps) {
        return HEIGHT;
        // return 0.5 * props.viewWindow.getLength();
    }
    

    render() {
        const {placedInteractions, viewWindow, width, opacityScale, color, onInteractionHovered,
            onMouseOut} = this.props;
        const arcs = [], arcHeights = [];
        const curveYScale = scaleLinear().domain([0, viewWindow.getLength()]).range([0, HEIGHT]).clamp(true);
        let sortedInteractions = placedInteractions.slice().sort((a, b) => b.interaction.score - a.interaction.score);
        sortedInteractions = sortedInteractions.slice(0, ITEM_LIMIT); // Only render ITEM_LIMIT highest scores
        for (const [index, placedInteraction] of sortedInteractions.entries()) {
            const score = placedInteraction.interaction.score;
            if (!score) {
                continue;
            }

            const {xSpan1, xSpan2} = placedInteraction;
            const xSpan1Center = 0.5 * (xSpan1.start + xSpan1.end);
            const xSpan2Center = 0.5 * (xSpan2.start + xSpan2.end);
            const spanCenter = 0.5 * (xSpan1Center + xSpan2Center);
            const spanLength = xSpan2Center - xSpan1Center;
            if (spanLength < 1) {
                continue;
            }
            const arcHeight = curveYScale(spanLength) * 0.5 + 10;
            // const arcHeight =  Math.max(50, spanLength * ((1 / Math.SQRT2) - 0.5) + 22);
            // const arcHeight = 0.375 * Math.abs( - xSpan1.start - xSpan2.start + 2 * spanCenter);
            if(spanCenter > viewWindow.start && spanCenter < viewWindow.end) {
                arcHeights.push(arcHeight);
            }
            arcs.push(<path
                key={placedInteraction.generateKey()+index}
                d={moveTo(xSpan1Center, 0) + quadraticCurveTo(spanCenter, curveYScale(spanLength), xSpan2Center, 0)}
                fill="none"
                opacity={opacityScale(score)}
                className="ArcDisplay-emphasize-on-hover"
                stroke={color}
                strokeWidth={STROKE_WIDTH}
                onMouseMove={event => onInteractionHovered(event, placedInteraction.interaction)} // tslint:disable-line
            />);
        }
        const height = arcHeights.length > 0 ? Math.round(_.max(arcHeights)) : 50;
        return <svg width={width} height={height} onMouseOut={onMouseOut}>{arcs}</svg>;
    }
}

function moveTo(x: number, y: number) {
    return `M ${x} ${y} `;
}

function quadraticCurveTo(controlX: number, controlY: number, x: number, y: number) {
    return `Q ${controlX} ${controlY}, ${x} ${y} `;
}
