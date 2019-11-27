import React from 'react';
import { ScaleLinear } from 'd3-scale';
import pointInPolygon from 'point-in-polygon';
import { GenomeInteraction } from '../../../model/GenomeInteraction';
import { PlacedInteraction } from '../../../model/FeaturePlacer';
import OpenInterval from '../../../model/interval/OpenInterval';
import DesignRenderer, { RenderTypes } from '../../../art/DesignRenderer';
import HoverTooltipContext from '../commonComponents/tooltip/HoverTooltipContext';

interface SquareDisplayProps {
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

export class SquareDisplay extends React.PureComponent<SquareDisplayProps, {}> {
    static getHeight(props: SquareDisplayProps) {
        return props.viewWindow.getLength();
    }

    hmData: any[];

    renderRect = (placedInteraction: PlacedInteraction, index: number) => {
        const { opacityScale, color, color2, viewWindow } = this.props;
        const score = placedInteraction.interaction.score;
        if (!score) {
            return null;
        }
        const { xSpan1, xSpan2 } = placedInteraction;
        if (!(xSpan1.start >= viewWindow.start && xSpan2.end <= viewWindow.end)) {
            return null;
        }

        const pointLeft = [ // Going counterclockwise
            [xSpan1.start, xSpan1.start], // Top
            [xSpan1.end, xSpan1.start], // Left
            [xSpan1.end, xSpan1.end], // Bottom = left + halfSpan2
            [xSpan1.start, xSpan1.end] // Right
        ];
        const pointRight = [ // Going counterclockwise
            [xSpan2.start, xSpan2.start], // Top
            [xSpan2.end, xSpan2.start], // Left
            [xSpan2.end, xSpan2.end], // Bottom = left + halfSpan2
            [xSpan2.start, xSpan2.end] // Right
        ];
        const key = placedInteraction.generateKey() + index;
        // only push the points in screen
        if (xSpan2.end < SquareDisplay.getHeight(this.props)) {
            this.hmData.push({
                pointLeft,
                pointRight,
                interaction: placedInteraction.interaction,
            })
        }

        return <g key={key}>
            <polygon
                key={key + 'left'}
                points={pointLeft as any} // React can convert the array to a string
                fill={score >= 0 ? color : color2}
                opacity={opacityScale(score)}
            // onMouseMove={event => onInteractionHovered(event, placedInteraction.interaction)} // tslint:disable-line
            />
            <polygon
                key={key + 'right'}
                points={pointRight as any} // React can convert the array to a string
                fill={score >= 0 ? color : color2}
                opacity={opacityScale(score)}
            // onMouseMove={event => onInteractionHovered(event, placedInteraction.interaction)} // tslint:disable-line
            />
        </g>;

        // const height = bootomYs.length > 0 ? Math.round(_.max(bootomYs)) : 50;
        // return <svg width={width} height={height} onMouseOut={onMouseOut} >{diamonds}</svg>;
        // return <svg width={width} height={SquareDisplay.getHeight(this.props)} onMouseOut={onMouseOut} >{diamonds}</svg>;
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
            if (pointInPolygon([x, y], item.pointLeft) || pointInPolygon([x, y], item.pointRight)) {
                return item;
            }
        }
        return null;
    }

    render() {
        this.hmData = []
        const { placedInteractions, width, forceSvg } = this.props;
        const drawHeight = SquareDisplay.getHeight(this.props);
        return <HoverTooltipContext getTooltipContents={this.renderTooltip} useRelativeY={true}>
            <DesignRenderer type={forceSvg ? RenderTypes.SVG : RenderTypes.CANVAS}
                width={width} height={drawHeight} onMouseMove={this.renderTooltip}>
                {placedInteractions.map(this.renderRect)}
            </DesignRenderer>
        </HoverTooltipContext>
    }
}
