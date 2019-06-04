import React from 'react';
import { ScaleLinear } from 'd3-scale';
import pointInPolygon from 'point-in-polygon';
import { GenomeInteraction } from '../../../model/GenomeInteraction';
import { PlacedInteraction } from '../../../model/FeaturePlacer';
import OpenInterval from '../../../model/interval/OpenInterval';
import DesignRenderer, { RenderTypes } from '../../../art/DesignRenderer';
import HoverTooltipContext from '../commonComponents/tooltip/HoverTooltipContext';

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

    hmData: any[];

    renderRect = (placedInteraction: PlacedInteraction, index: number) => {
        const { opacityScale, color, color2, viewWindow, height} = this.props;
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
        const bottomY = topY + halfSpan1 + halfSpan2;
        const points = [ // Going counterclockwise
            [topX, topY], // Top
            [topX - halfSpan1, topY + halfSpan1], // Left
            [topX - halfSpan1 + halfSpan2, bottomY], // Bottom = left + halfSpan2
            [topX + halfSpan2, topY + halfSpan2] // Right
        ];
        const key = placedInteraction.generateKey()+index;
        // only push the points in screen
        if (topX + halfSpan2 > viewWindow.start && topX - halfSpan1 < viewWindow.end && topY < height) {
            this.hmData.push({
                points,
                interaction: placedInteraction.interaction,
            })
        }
        
        return <polygon
            key={key}
            points={points as any} // React can convert the array to a string
            fill={score >=0 ? color : color2}
            opacity={opacityScale(score)}
            // onMouseMove={event => onInteractionHovered(event, placedInteraction.interaction)} // tslint:disable-line
        />;
    
        // const height = bootomYs.length > 0 ? Math.round(_.max(bootomYs)) : 50;
        // return <svg width={width} height={height} onMouseOut={onMouseOut} >{diamonds}</svg>;
        // return <svg width={width} height={Heatmap.getHeight(this.props)} onMouseOut={onMouseOut} >{diamonds}</svg>;
    }

    /**
     * Renders the default tooltip that is displayed on hover.
     * 
     * @param {number} relativeX - x coordinate of hover relative to the visualizer
     * @param {number} relativeY - y coordinate of hover relative to the visualizer
     * @return {JSX.Element} tooltip to render
     */
    renderTooltip = (relativeX: number, relativeY: number): JSX.Element => {
        const polygon = this.findPolygon(relativeX, relativeY);
        if (polygon) {
            return <div>
                    <div>Locus1: {polygon.interaction.locus1.toString()}</div>
                    <div>Locus2: {polygon.interaction.locus2.toString()}</div>
                    <div>Score: {polygon.interaction.score}</div>
                </div>;
        } else {
            return null;
        }
    }

    findPolygon = (x: number, y: number): any => {
        for (const item of this.hmData) {
            if(pointInPolygon([x, y], item.points)) {
                return item;
            }
        }
        return null;
    }

    render() {
        // this.polygonCollection.features = [];
        this.hmData = []
        const {placedInteractions, width, forceSvg, height} = this.props;
        return <HoverTooltipContext getTooltipContents={this.renderTooltip} useRelativeY={true}>
                    <DesignRenderer type={forceSvg ? RenderTypes.SVG : RenderTypes.CANVAS} 
                                        width={width} height={height} onMouseMove={this.renderTooltip}>
                        {placedInteractions.map(this.renderRect)}
                    </DesignRenderer>
                </HoverTooltipContext>
    }
}
