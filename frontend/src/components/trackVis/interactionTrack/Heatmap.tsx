import React from 'react';
import { ScaleLinear } from 'd3-scale';
// import _ from 'lodash';
import { GenomeInteraction } from '../../../model/GenomeInteraction';
import { PlacedInteraction } from '../../../model/FeaturePlacer';
import OpenInterval from '../../../model/interval/OpenInterval';
import DesignRenderer, { RenderTypes } from '../../../art/DesignRenderer';

interface HeatmapProps {
    placedInteractions: PlacedInteraction[];
    viewWindow: OpenInterval;
    width: number;
    height: number;
    opacityScale: ScaleLinear<number, number>;
    color: string;
    color2: string;
    onInteractionHovered(event: React.MouseEvent, interaction: GenomeInteraction): void;
    onMouseOut(event: React.MouseEvent): void;
    forceSvg?: boolean;
}

export class Heatmap extends React.PureComponent<HeatmapProps, {}> {
    // static getHeight(props: HeatmapProps) {
    //     return 0.5 * props.viewWindow.getLength();
    // }

    renderRect = (placedInteraction: PlacedInteraction, index: number) => {
        const { opacityScale, color, color2, onInteractionHovered, viewWindow} = this.props;
        const bootomYs = [];
        const score = placedInteraction.interaction.score;
        if (!score) {
            return null;
        }
        const {xSpan1, xSpan2} = placedInteraction;
        if (xSpan1.end < viewWindow.start && xSpan2.start > viewWindow.end) {
            return null;
        }
        const gapCenter = (xSpan1.end + xSpan2.start) / 2;
        const gapLength = xSpan2.start - xSpan1.end;
        const topX = gapCenter;
        const topY = 0.5 * gapLength;
        const halfSpan1 = Math.max(0.5 * xSpan1.getLength(), 1);
        const halfSpan2 = Math.max(0.5 * xSpan2.getLength(), 1);
        // const halfSpan1 = 0.5 * xSpan1.getLength();
        // const halfSpan2 = 0.5 * xSpan2.getLength();
        const bottomY = topY + halfSpan1 + halfSpan2;
        if(gapCenter > viewWindow.start && gapCenter < viewWindow.end) {
            bootomYs.push(bottomY);
        }
        const points = [ // Going counterclockwise
            [topX, topY], // Top
            [topX - halfSpan1, topY + halfSpan1], // Left
            [topX - halfSpan1 + halfSpan2, bottomY], // Bottom = left + halfSpan2
            [topX + halfSpan2, topY + halfSpan2] // Right
        ];
        return <polygon
            key={placedInteraction.generateKey()+index}
            points={points as any} // React can convert the array to a string
            fill={score >=0 ? color : color2}
            opacity={opacityScale(score)}
            onMouseMove={event => onInteractionHovered(event, placedInteraction.interaction)} // tslint:disable-line
        />;
    
        // const height = bootomYs.length > 0 ? Math.round(_.max(bootomYs)) : 50;
        // return <svg width={width} height={height} onMouseOut={onMouseOut} >{diamonds}</svg>;
        // return <svg width={width} height={Heatmap.getHeight(this.props)} onMouseOut={onMouseOut} >{diamonds}</svg>;
    }

    render() {
        const {placedInteractions, width, forceSvg, height} = this.props;
        return <DesignRenderer type={forceSvg ? RenderTypes.SVG : RenderTypes.CANVAS} 
                            width={width} height={height}>
            {placedInteractions.map(this.renderRect)}
        </DesignRenderer>
    }
}
