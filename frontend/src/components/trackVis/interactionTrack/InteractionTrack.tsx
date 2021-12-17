import React from "react";
// import _ from "lodash";
import memoizeOne from "memoize-one";
import { scaleLinear } from "d3-scale";
import { notify } from "react-notify-toast";
import percentile from 'percentile';

import { Heatmap } from "./Heatmap";
import { ArcDisplay } from "./ArcDisplay";
import { CubicCurveDisplay } from "./CubicCurveDisplay";
import { SquareDisplay } from "./SquareDisplay";

import Track, { PropsFromTrackContainer } from "../commonComponents/Track";
import TrackLegend from "../commonComponents/TrackLegend";
import configOptionMerging from "../commonComponents/configOptionMerging";
import { withTooltip, TooltipCallbacks } from "../commonComponents/tooltip/withTooltip";
import Tooltip from "../commonComponents/tooltip/Tooltip";

import { InteractionDisplayMode } from "../../../model/DisplayModes";
import { FeaturePlacer } from "../../../model/FeaturePlacer";
import { GenomeInteraction } from "../../../model/GenomeInteraction";
import { ScaleChoices } from "../../../model/ScaleChoices";
import { TrackFileMeta } from "../commonComponents/TrackFileMeta";

const TOP_PADDING = 2;

interface InteractionTrackProps extends PropsFromTrackContainer, TooltipCallbacks {
    data: GenomeInteraction[];
    options: {
        color: string;
        color2?: string;
        backgroundColor?: string;
        displayMode: InteractionDisplayMode;
        binSize?: number;
        scoreScale?: string;
        scalePercentile?: number;
        scoreMax?: number;
        scoreMin?: number;
        height: number;
        lineWidth?: number;
        greedyTooltip?: boolean;
        fetchViewWindowOnly?: boolean,
        maxValueFilter?: number,
        minValueFilter?: number,
        bothAnchorsInView?: boolean,

    };
    forceSvg?: boolean;
    getBeamRefs?: any;
    onSetAnchors3d?: any;
    isThereG3dTrack?: boolean;
}

export const DEFAULT_OPTIONS = {
    color: "#B8008A",
    color2: "#006385",
    backgroundColor: "white",
    displayMode: InteractionDisplayMode.HEATMAP,
    scoreScale: ScaleChoices.AUTO,
    scoreMax: 10,
    scalePercentile: 95,
    scoreMin: 0,
    height: 500,
    lineWidth: 2,
    greedyTooltip: false,
    fetchViewWindowOnly: false,
    bothAnchorsInView: false,
    isThereG3dTrack: false,

};
const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);

class InteractionTrack extends React.PureComponent<InteractionTrackProps, {}> {
    public featurePlacer: FeaturePlacer;

    scales: any;

    constructor(props: InteractionTrackProps) {
        super(props);
        this.scales = null;
        this.featurePlacer = new FeaturePlacer();
        this.featurePlacer.placeInteractions = memoizeOne(this.featurePlacer.placeInteractions);
        // this.computeScale = memoizeOne(this.computeScale);
        this.showTooltip = this.showTooltip.bind(this);
        this.hideTooltip = this.hideTooltip.bind(this);
    }

    computeScale = () => {
        const { data } = this.props;
        const { scoreScale, scoreMin, scoreMax, height, scalePercentile } = this.props.options;
        if (scoreScale === ScaleChoices.AUTO) {
            // const maxScore = this.props.data.length > 0 ? _.maxBy(this.props.data, "score").score : 10;
            const item = percentile(scalePercentile, data, item => item.score);
            // console.log(item)
            const maxScore = data.length > 0 ? (item as GenomeInteraction).score : 10;
            // console.log(maxScore)
            return {
                opacityScale: scaleLinear().domain([0, maxScore]).range([0, 1]).clamp(true),
                heightScale: scaleLinear()
                    .domain([0, maxScore])
                    .range([0, height - TOP_PADDING])
                    .clamp(true),
                min: 0,
                max: maxScore,
            };
        } else {
            if (scoreMin >= scoreMax) {
                notify.show("Score min cannot be greater than Score max", "error", 2000);
                return {
                    opacityScale: scaleLinear()
                        .domain([scoreMax - 1, scoreMax])
                        .range([0, 1])
                        .clamp(true),
                    heightScale: scaleLinear()
                        .domain([scoreMax - 1, scoreMax])
                        .range([0, height - TOP_PADDING])
                        .clamp(true),
                    min: scoreMax - 1,
                    max: scoreMax,
                };
            }
            return {
                opacityScale: scaleLinear().domain([scoreMin, scoreMax]).range([0, 1]).clamp(true),
                heightScale: scaleLinear()
                    .domain([scoreMin, scoreMax])
                    .range([0, height - TOP_PADDING])
                    .clamp(true),
                min: scoreMin,
                max: scoreMax,
            };
        }
    };

    showTooltip(event: React.MouseEvent, interaction: GenomeInteraction) {
        const tooltip = (
            <Tooltip pageX={event.pageX} pageY={event.pageY} ignoreMouse={true}>
                <div>
                    <div>Locus1: {interaction.locus1.toString()}</div>
                    <div>Locus2: {interaction.locus2.toString()}</div>
                    <div>Score: {interaction.score}</div>
                </div>
            </Tooltip>
        );
        this.props.onShowTooltip(tooltip);
    }

    hideTooltip() {
        this.props.onHideTooltip();
    }

    filterData = (data: GenomeInteraction[]): GenomeInteraction[] => {
        const { minValueFilter, maxValueFilter } = this.props.options;
        let filteredData: GenomeInteraction[] = [];
        if (maxValueFilter && !isNaN(maxValueFilter)) {
            filteredData = data.filter(d => d.score <= maxValueFilter)
        } else {
            filteredData = data;
        }
        if (minValueFilter && !isNaN(minValueFilter)) {
            filteredData = filteredData.filter(d => d.score >= minValueFilter)
        }
        return filteredData;
    }

    render(): JSX.Element {
        const { data, trackModel, visRegion, width, viewWindow, options, forceSvg, getBeamRefs, onShowTooltip, onHideTooltip, onSetAnchors3d, isThereG3dTrack } = this.props;
        const filteredData = this.filterData(data);
        this.scales = this.computeScale();
        const visualizerProps = {
            placedInteractions: this.featurePlacer.placeInteractions(filteredData, visRegion, width),
            viewWindow,
            width,
            height: options.height,
            opacityScale: this.scales.opacityScale,
            heightScale: this.scales.heightScale,
            color: options.color,
            color2: options.color2,
            lineWidth: options.lineWidth,
            binSize: options.binSize,
            onInteractionHovered: this.showTooltip,
            onMouseOut: this.hideTooltip,
            onShowTooltip,
            onHideTooltip,
            onSetAnchors3d,
            forceSvg,
            greedyTooltip: options.greedyTooltip,
            bothAnchorsInView: options.bothAnchorsInView,
            isThereG3dTrack,
        };
        let visualizer; // , height;
        // if (options.displayMode === InteractionDisplayMode.HEATMAP) {
        //     visualizer = <Heatmap {...visualizerProps} />;
        //     // height = Heatmap.getHeight(visualizerProps);
        // } else {
        //     visualizer = <ArcDisplay {...visualizerProps} />;
        //     // height = ArcDisplay.getHeight(visualizerProps);
        // }
        switch (options.displayMode) {
            case InteractionDisplayMode.HEATMAP:
                visualizer = <Heatmap {...visualizerProps} getBeamRefs={getBeamRefs} />;
                break;
            case InteractionDisplayMode.FLATARC:
                visualizer = <CubicCurveDisplay {...visualizerProps} />;
                break;
            case InteractionDisplayMode.ARC:
                visualizer = <ArcDisplay {...visualizerProps} />;
                break;
            case InteractionDisplayMode.SQUARE:
                visualizer = <SquareDisplay {...visualizerProps} />;
                break;
            default:
                visualizer = <ArcDisplay {...visualizerProps} />;
        }

        return (
            <Track
                {...this.props}
                legend={
                    <TrackLegend
                        trackModel={trackModel}
                        height={options.height}
                        axisScale={
                            options.displayMode === InteractionDisplayMode.FLATARC ? this.scales.heightScale : undefined
                        }
                    />
                }
                // legend={<TrackLegend trackModel={trackModel} height={50} />}
                visualizer={
                    <div>
                        {visualizer}
                        <TrackFileMeta meta={this.props.meta} viewWindow={this.props.viewWindow} />
                    </div>
                }
            />
        );
    }
}

export default withDefaultOptions(withTooltip(InteractionTrack as any));
