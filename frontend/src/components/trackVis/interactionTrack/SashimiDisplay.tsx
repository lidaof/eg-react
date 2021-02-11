import React from 'react';
import { PlacedInteraction } from '../../../model/FeaturePlacer';
import OpenInterval from '../../../model/interval/OpenInterval';
import { GenomeInteraction } from '../../../model/GenomeInteraction';
import DesignRenderer, { RenderTypes } from '../../../art/DesignRenderer';
import HoverTooltipContext from '../commonComponents/tooltip/HoverTooltipContext';
import { moveTo, cubicCurveTo } from './ArcDisplay';
import { ScaleLinear } from 'd3-scale';

interface SashimiDisplayProps {
    placedInteractions: PlacedInteraction[];
    viewWindow: OpenInterval;
    width: number;
    height: number;
    lineWidth?: number;
    heightScale: ScaleLinear<number, number>;
    // opacityScale: ScaleLinear<number, number>;
    color: string;
    color2: string;
    onInteractionHovered(event: React.MouseEvent, interaction: GenomeInteraction): void;
    onMouseOut(event: React.MouseEvent): void;
    forceSvg?: boolean;
    bothAnchorsInView?: boolean;
}

export class SashimiDisplay extends React.PureComponent<SashimiDisplayProps, {}> {


    renderCurve = (placedInteraction: PlacedInteraction, index: number) => {
        const { color, color2, lineWidth, heightScale, bothAnchorsInView, viewWindow } = this.props;
        const score = placedInteraction.interaction.score;
        if (!score) {
            return null;
        }
        const { xSpan1, xSpan2 } = placedInteraction;
        let xSpan1Center, xSpan2Center;
        if (xSpan1.start === xSpan2.start && xSpan1.end === xSpan2.end) { // inter-region arc
            xSpan1Center = xSpan1.start;
            xSpan2Center = xSpan1.end;
        } else {
            xSpan1Center = 0.5 * (xSpan1.start + xSpan1.end);
            xSpan2Center = 0.5 * (xSpan2.start + xSpan2.end);
        }
        if (bothAnchorsInView) {
            if (xSpan1.start < viewWindow.start || xSpan2.end > viewWindow.end) {
                return null;
            }
        }
        const spanLength = xSpan2Center - xSpan1Center;
        if (spanLength < 1) {
            return null;
        }
        const arcCenter = xSpan1Center + 0.5 * spanLength;
        const controlY = 20;
        console.log(score.toString());
        console.log(arcCenter);
        return (
            <g key={placedInteraction.generateKey() + index}>
                <path
                    key={placedInteraction.generateKey() + index + "path"}
                    d={moveTo(xSpan1Center, 0) + cubicCurveTo(xSpan1Center, controlY, xSpan2Center, controlY, xSpan2Center, 0)}
                    fill="none"
                    // opacity={opacityScale(score)}
                    stroke={score >= 0 ? color : color2}
                    strokeWidth={lineWidth}
                    // onMouseMove={event => onInteractionHovered(event, placedInteraction.interaction)} // tslint:disable-line
                />
                <text key={placedInteraction.generateKey() + index + "text"}
                    x={arcCenter} y={40} dominantBaseline="middle" style={{ textAnchor: "middle", fill: "black", fontSize: 10 }}>
                    {score.toString()}
                </text>
            </g>
        );
        // const height = arcHeights.length > 0 ? Math.round(_.max(arcHeights)) : 50;
        // return <svg width={width} height={height} onMouseOut={onMouseOut}>{arcs}</svg>;
    }


    render() {
        const { placedInteractions, width, forceSvg, height } = this.props;
        // const sortedInteractions = placedInteractions.slice().sort((a, b) 
        //        => b.interaction.score - a.interaction.score);
        // const slicedInteractions = sortedInteractions.slice(0, ITEM_LIMIT); // Only render ITEM_LIMIT highest scores
        return <HoverTooltipContext useRelativeY={true}>
            <DesignRenderer type={forceSvg ? RenderTypes.SVG : RenderTypes.CANVAS}
                width={width} height={height}>
                {placedInteractions.map(this.renderCurve)}
            </DesignRenderer>
        </HoverTooltipContext>
    }
}
