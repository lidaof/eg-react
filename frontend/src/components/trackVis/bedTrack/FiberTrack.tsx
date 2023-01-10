import React from "react";
import memoizeOne from "memoize-one";
import _ from 'lodash';
import { scaleLinear } from 'd3-scale';
import FiberAnnotation from "./FiberAnnotation";
import Track, { PropsFromTrackContainer } from "../commonComponents/Track";
import AnnotationTrack from "../commonComponents/annotation/AnnotationTrack";
import { withTooltip, TooltipCallbacks } from "../commonComponents/tooltip/withTooltip";
import { Fiber } from "../../../model/Feature";
import { PlacedFeatureGroup } from "../../../model/FeatureArranger";
import OpenInterval from "model/interval/OpenInterval";
import configOptionMerging from "../commonComponents/configOptionMerging";
import DisplayedRegionModel from "model/DisplayedRegionModel";
import { FeaturePlacer } from "model/FeaturePlacer";
import TrackLegend from "../commonComponents/TrackLegend";
import HoverTooltipContext from "../commonComponents/tooltip/HoverTooltipContext";
import DesignRenderer, { RenderTypes } from "art/DesignRenderer";
import { FiberDisplayModes } from "model/DisplayModes";

const ROW_VERTICAL_PADDING = 2;
export const FIBER_DENSITY_CUTOFF_LENGTH = 300000;

interface FiberTrackProps extends PropsFromTrackContainer, TooltipCallbacks {
    data: Fiber[];
    options: {
        color?: string;
        color2?: string;
        hiddenPixels?: number;
        rowHeight: number;
        height: number; // for density mode
        displayMode: FiberDisplayModes,
    };
    forceSvg?: boolean;
}

interface AggregatedFiber {
    on: number;
    off: number;
    count: number;
}

export const DEFAULT_OPTIONS = {
    hiddenPixels: 0.5,
    rowHeight: 40,
    color: 'orangered',
    color2: 'blue',
    height: 40,
    displayMode: FiberDisplayModes.AUTO,
}

const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);

// const NAMES = ['chr11:5273848-5284079', 'chr11:5279356-5288355', 'chr11:5268918-5283588', 'chr11:5278466-5287241', 'chr11:5274928-5292829']

/**
 * Track component for fibers/methylmod.
 *
 * @author Daofeng Li
 */
class FiberTrackNoTooltip extends React.Component<FiberTrackProps> {
    static displayName = "FiberTrack";
    xMap: AggregatedFiber[];
    scales: any;

    constructor(props: FiberTrackProps) {
        super(props);
        this.renderAnnotation = this.renderAnnotation.bind(this);
        this.aggregateFibers = memoizeOne(this.aggregateFibers);
    }

    paddingFunc = (feature: Fiber, xSpan: OpenInterval) => {
        const width = xSpan.end - xSpan.start;
        const estimatedLabelWidth = feature.getName().length * 9;
        if (estimatedLabelWidth < 0.5 * width) {
            return 5;
        } else {
            return 9 + estimatedLabelWidth;
        }
    };

    /**
     * Renders one annotation.
     *
     * @param {PlacedFeature} - feature and drawing info
     * @param {number} y - y coordinate to render the annotation
     * @param {boolean} isLastRow - whether the annotation is assigned to the last configured row
     * @param {number} index - iteration index
     * @return {JSX.Element} element visualizing the feature
     */
    renderAnnotation(placedGroup: PlacedFeatureGroup, y: number, isLastRow: boolean, index: number) {
        return placedGroup.placedFeatures.map((placement, i) => (
            <FiberAnnotation
                key={i}
                placement={placement}
                y={y}
                isMinimal={isLastRow}
                color={this.props.options.color}
                color2={this.props.options.color2}
                rowHeight={this.props.options.rowHeight}
                onShowTooltip={this.props.onShowTooltip}
                onHideTooltip={this.props.onHideTooltip}
                hiddenPixels={this.props.options.hiddenPixels}
                displayMode={this.props.options.displayMode}
            />
        ));
    }

    /**
     * 
     * @param data 
     * @param viewRegion 
     * @param width 
     * @returns 
     */
    aggregateFibers = (data: Fiber[], viewRegion: DisplayedRegionModel, width: number) => {
        width = Math.round(width); // Sometimes it's juuust a little bit off from being an int
        const xToFibers = Array(width).fill(null);
        for (let x = 0; x < width; x++) {
            // Fill the array with empty arrays
            xToFibers[x] = { on: 0, off: 0, count: 0 };
        }
        const placer = new FeaturePlacer();
        const placement = placer.placeFeatures(data, viewRegion, width);
        for (const placedFeature of placement) {
            const { feature, xSpan, visiblePart } = placedFeature;
            const { relativeStart, relativeEnd } = visiblePart;
            const segmentWidth = relativeEnd - relativeStart;
            const startX = Math.max(0, Math.floor(xSpan.start));
            const endX = Math.min(width - 1, Math.ceil(xSpan.end));
            for (let x = startX; x <= endX; x++) {
                xToFibers[x].count += 1;
            }
            (feature as Fiber).ons.forEach((rbs) => {
                const bs = Math.abs(rbs);
                if (bs >= relativeStart && bs < relativeEnd) {
                    const x = startX + Math.floor(((bs - relativeStart) / segmentWidth) * (endX - startX));
                    xToFibers[x].on += 1;
                }
            });
            (feature as Fiber).offs.forEach((rbs) => {
                const bs = Math.abs(rbs);
                if (bs >= relativeStart && bs < relativeEnd) {
                    const x = startX + Math.floor(((bs - relativeStart) / segmentWidth) * (endX - startX));
                    xToFibers[x].off += 1;
                }
            });
        }
        return xToFibers;
    }

    computeScales = () => {
        const { height } = this.props.options;
        const pcts = this.xMap.map((x) => x.on / (x.on + x.off));
        const maxPct = _.max(pcts);
        const counts = this.xMap.map((x) => x.count);
        const maxCount = _.max(counts);
        return {
            pctToY: scaleLinear().domain([maxPct, 0]).range([ROW_VERTICAL_PADDING, height]).clamp(true),
            countToY: scaleLinear().domain([maxCount, 0]).range([ROW_VERTICAL_PADDING, height]).clamp(true),
            pcts,
            maxPct,
            counts,
        };
    }

    renderTooltipContents = (x: number) => {
        const item = this.xMap[Math.round(x)];
        if (!item.count) { return null };
        return <div>
            <div>{item.on} modified base(s)/{item.off} canonical base(s)</div>
            <div>{item.count} reads</div>
        </div>
    }

    visualizer = () => {
        const { pctToY, countToY, pcts, counts } = this.scales;
        const { height, color, color2, displayMode } = this.props.options;
        const bars: any[] = [];
        const lines = [];
        pcts.forEach((pct: number, idx: number) => {
            if (pct) {
                if (displayMode === FiberDisplayModes.AUTO) {
                    const y = pctToY(pct);
                    bars.push(<rect key={idx} x={idx} width={1} y={y} height={height - y} fill={color} fillOpacity={0.7} />)
                } else {
                    const fillColor = pct >= 0.5 ? color : color2;
                    bars.push(<rect key={idx} x={idx} width={1} y={0} height={height} fill={fillColor} fillOpacity={0.5} />)
                }
            }
        });
        for (let i = 0; i < counts.length - 1; i++) {
            const current = counts[i];
            const next = counts[i + 1];
            if (!current) {
                continue;
            }
            const y1 = countToY(current);
            const y2 = countToY(next);
            lines.push(<line key={i} x1={i} y1={y1} x2={i + 1} y2={y2} stroke="#525252" />);
        }
        return (
            <HoverTooltipContext tooltipRelativeY={height} getTooltipContents={this.renderTooltipContents} >
                <DesignRenderer
                    type={this.props.forceSvg ? RenderTypes.SVG : RenderTypes.CANVAS}
                    width={this.props.width}
                    height={height}
                >
                    {bars}
                    {lines}
                </DesignRenderer>
            </HoverTooltipContext>
        );
    }

    render() {
        const { data, visRegion, width, options, trackModel } = this.props;
        if (visRegion.getWidth() > FIBER_DENSITY_CUTOFF_LENGTH) {
            this.xMap = this.aggregateFibers(data, visRegion, width);
            this.scales = this.computeScales();
            return <Track
                {...this.props}
                legend={
                    <div>
                        <TrackLegend trackModel={trackModel} height={options.height} axisScale={options.displayMode === FiberDisplayModes.AUTO ? this.scales.pctToY : this.scales.countToY}
                        />
                    </div>
                }
                visualizer={this.visualizer()}
            />
        }
        return (
            <AnnotationTrack
                {...this.props}
                rowHeight={options.rowHeight + ROW_VERTICAL_PADDING}
                getAnnotationElement={this.renderAnnotation}
                featurePadding={this.paddingFunc}
            />
        );
    }
}

export const FiberTrack = withDefaultOptions(withTooltip(FiberTrackNoTooltip as any));
