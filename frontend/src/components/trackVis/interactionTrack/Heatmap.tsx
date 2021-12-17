import React from 'react';
import { ScaleLinear } from 'd3-scale';
// import _ from 'lodash';
import pointInPolygon from 'point-in-polygon';
import { GenomeInteraction } from '../../../model/GenomeInteraction';
import { PlacedInteraction } from '../../../model/FeaturePlacer';
import OpenInterval from '../../../model/interval/OpenInterval';
import DesignRenderer, { RenderTypes } from '../../../art/DesignRenderer';
import HoverTooltipContext from '../commonComponents/tooltip/HoverTooltipContext';
import { withTrackLegendWidth } from 'components/withTrackLegendWidth';
import Tooltip from '../commonComponents/tooltip/Tooltip';
import { getRelativeCoordinates } from '../../../util';

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
    bothAnchorsInView?: boolean;
    legendWidth: number;
    getBeamRefs: any;
    onSetAnchors3d?: any;
    onShowTooltip?: any;
    onHideTooltip?: any;
    isThereG3dTrack?: boolean;
}

class HeatmapNoLegendWidth extends React.PureComponent<HeatmapProps, {}> {
    // static getHeight(props: HeatmapProps) {
    //     return 0.5 * props.viewWindow.getLength();
    // }

    hmData: any[];
    beamLeft: any;
    beamRight: any;

    // constructor(props: HeatmapProps) {
    //     super(props);
    //     this.findPolygon = _.debounce(this.findPolygon, 100);
    // }

    componentDidMount() {
        // this.beamLeft = document.getElementById('beamLeft');
        // this.beamRight = document.getElementById('beamRight');
        if (this.props.getBeamRefs) {
            const beamRefs = this.props.getBeamRefs();
            this.beamLeft = beamRefs[0];
            this.beamRight = beamRefs[1];
        }
    }

    renderRect = (placedInteraction: PlacedInteraction, index: number) => {
        const { opacityScale, color, color2, viewWindow, height, bothAnchorsInView } = this.props;
        const score = placedInteraction.interaction.score;
        if (!score) {
            return null;
        }
        const { xSpan1, xSpan2 } = placedInteraction;
        if (xSpan1.end < viewWindow.start && xSpan2.start > viewWindow.end) {
            return null;
        }
        if (bothAnchorsInView) {
            if (xSpan1.start < viewWindow.start || xSpan2.end > viewWindow.end) {
                return null;
            }
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
        const key = placedInteraction.generateKey() + index;
        // only push the points in screen
        if (topX + halfSpan2 > viewWindow.start && topX - halfSpan1 < viewWindow.end && topY < height) {
            this.hmData.push({
                points,
                interaction: placedInteraction.interaction,
                xSpan1,
                xSpan2,
            })
        }

        return <polygon
            key={key}
            points={points as any} // React can convert the array to a string
            fill={score >= 0 ? color : color2}
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
        const { viewWindow, legendWidth } = this.props;
        if (polygon) {
            const { xSpan1, xSpan2, interaction } = polygon;
            const left = xSpan1.start - viewWindow.start + legendWidth;
            const right = xSpan2.start - viewWindow.start + legendWidth;
            const leftWidth = Math.max(xSpan1.getLength(), 1);
            const rightWidth = Math.max(xSpan2.getLength(), 1);
            if (this.beamLeft) {
                this.beamLeft.style.display = 'block';
                this.beamLeft.style.left = left + 'px';
                this.beamLeft.style.width = leftWidth + 'px';
                if (left < legendWidth) {
                    this.beamLeft.style.display = 'none';
                }
            }
            if (this.beamRight) {
                if ((right + rightWidth) <= (viewWindow.end - viewWindow.start + legendWidth)) {
                    this.beamRight.style.display = 'block';
                    this.beamRight.style.left = right + 'px';
                    this.beamRight.style.width = rightWidth + 'px';
                } else {
                    this.beamRight.style.display = 'none';
                }
            }
            return <div>
                <div>Locus1: {interaction.locus1.toString()}</div>
                <div>Locus2: {interaction.locus2.toString()}</div>
                <div>Score: {interaction.score}</div>
            </div>;
        } else {
            return null;
        }
    }

    closeBeam = () => {
        if (this.beamLeft) {
            this.beamLeft.style.display = 'none';
        }
        if (this.beamRight) {
            this.beamRight.style.display = 'none';
        }
    }

    findPolygon = (x: number, y: number): any => {
        for (const item of this.hmData) {
            if (pointInPolygon([x, y], item.points)) {
                return item;
            }
        }
        return null;
    }

    set3dAnchors = (anchors: any) => {
        if (this.props.onSetAnchors3d) {
            this.props.onSetAnchors3d(anchors)
        }
        this.props.onHideTooltip()
    }

    // clear3dAnchors = () => {
    //     if (this.props.onSetAnchors3d) {
    //         this.props.onSetAnchors3d([]);
    //     }
    //     this.props.onHideTooltip()
    // }

    clickTooltip = (event: React.MouseEvent) => {
        if (this.props.isThereG3dTrack) {
            const { x, y } = getRelativeCoordinates(event);
            const polygon = this.findPolygon(x, y);
            if (polygon) {
                const { interaction } = polygon;
                const tooltip = (
                    <Tooltip pageX={event.pageX} pageY={event.pageY} onClose={this.props.onHideTooltip}>
                        <div>
                            <button className="btn btn-sm btn-primary" onClick={() => this.set3dAnchors([interaction.locus1, interaction.locus2])}>Show in 3D</button>
                        </div>
                        {/* <div>
                        <button className="btn btn-sm btn-secondary" onClick={this.clear3dAnchors} >Clear in 3D</button>
                    </div> */}
                    </Tooltip>
                );
                this.props.onShowTooltip(tooltip);
            }
        }
    }

    render() {
        this.hmData = []
        const { placedInteractions, width, forceSvg, height } = this.props;
        return <HoverTooltipContext getTooltipContents={this.renderTooltip} useRelativeY={true}>
            <DesignRenderer type={forceSvg ? RenderTypes.SVG : RenderTypes.CANVAS}
                width={width} height={height} onMouseOut={this.closeBeam} onClick={this.clickTooltip} >
                {placedInteractions.map(this.renderRect)}
            </DesignRenderer>
        </HoverTooltipContext>
    }
}

export const Heatmap = withTrackLegendWidth(HeatmapNoLegendWidth);