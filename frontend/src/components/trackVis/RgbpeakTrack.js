import React from "react";
import PropTypes from "prop-types";
import { scaleLinear } from "d3-scale";
import memoizeOne from "memoize-one";
import _ from "lodash";
import Track from "./commonComponents/Track";
import AnnotationTrack from "./commonComponents/annotation/AnnotationTrack";
import TrackLegend from "./commonComponents/TrackLegend";
import Tooltip from "./commonComponents/tooltip/Tooltip";
import { withTooltip } from "./commonComponents/tooltip/withTooltip";
import configOptionMerging from "./commonComponents/configOptionMerging";

import { AnnotationDisplayModes } from "../../model/DisplayModes";
import { TranslatableG } from "../TranslatableG";
import BackgroundedText from "./commonComponents/BackgroundedText";
import { getContrastingColor } from "../../util";
import AnnotationArrows from "./commonComponents/annotation/AnnotationArrows";

import "./commonComponents/tooltip/Tooltip.css";

const TOP_PADDING = 2;
const TEXT_HEIGHT = 9; // height for both text label and arrows.
export const DEFAULT_OPTIONS = {
    maxRows: 1,
    height: 40,
    displayMode: AnnotationDisplayModes.FULL,
    hiddenPixels: 0,
};
const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);

/**
 * peak track based on bigbed format, use itemRgb for color, score as height
 * modified from RepeatTrack
 * @author Daofeng Li
 */

class RgbpeakTrack extends React.PureComponent {
    static propTypes = Object.assign({}, Track.propsFromTrackContainer, {
        data: PropTypes.array.isRequired,
    });

    constructor(props) {
        super(props);
        this.scales = null;
        this.renderAnnotation = this.renderAnnotation.bind(this);
        this.renderTooltip = this.renderTooltip.bind(this);
        this.computeScales = memoizeOne(this.computeScales);
    }

    // UNSAFE_componentWillReceiveProps(nextProps) {
    //     if (this.props.options !== nextProps.options) {
    //         this.setState(this.makeScale(nextProps));
    //     }
    // }

    computeScales(maxScore, height) {
        return { valueToY: scaleLinear().domain([maxScore, 0]).range([TOP_PADDING, height]) };
    }

    /**
     * Renders a group of bars.
     *
     * @param {PlacedFeatureGroup} placedGroup - features and draw location
     * @return {JSX.Element} element visualizing the feature
     */
    renderAnnotation(placedGroup) {
        const { height } = this.props.options;

        return placedGroup.placedFeatures.map((placement, i) => {
            const { xSpan, feature, isReverse } = placement;
            if (placement.xSpan.getLength <= 0) {
                return null;
            }

            const color = feature.itemRgb;
            const contrastColor = getContrastingColor(color);
            const y = this.scales.valueToY(feature.score);
            const drawHeight = height - y;
            const width = Math.max(xSpan.getLength(), 1); // min 1 px
            if (drawHeight <= 0) {
                return null;
            }
            const mainBody = (
                <rect x={xSpan.start} y={y} width={width} height={drawHeight} fill={color} fillOpacity={0.75} />
            );
            let label = null;
            const labelText = feature.getName();
            const estimatedLabelWidth = labelText.length * TEXT_HEIGHT;
            if (estimatedLabelWidth < 0.9 * width) {
                const centerX = xSpan.start + 0.5 * width;
                const centerY = height - TEXT_HEIGHT * 2;
                label = (
                    <BackgroundedText
                        x={centerX}
                        y={centerY}
                        height={TEXT_HEIGHT - 1}
                        fill={contrastColor}
                        dominantBaseline="hanging"
                        textAnchor="middle"
                    >
                        {labelText}
                    </BackgroundedText>
                );
            }
            const arrows = feature.strand !== "." && (
                <AnnotationArrows
                    startX={xSpan.start}
                    endX={xSpan.end}
                    y={height - TEXT_HEIGHT}
                    height={TEXT_HEIGHT}
                    opacity={0.75}
                    isToRight={isReverse === (feature.strand === "-")}
                    color="white"
                />
            );
            return (
                <TranslatableG onClick={(event) => this.renderTooltip(event, feature)} key={i}>
                    {mainBody}
                    {arrows}
                    {label}
                </TranslatableG>
            );
        });
    }

    /**
     * Renders the tooltip that appears when clicking on a repeat.
     *
     * @param {MouseEvent} event - mouse click event, used to determine tooltip coordinates
     * @param {Rgbpeak} feature - feature containing data to show in the tooltip
     */
    renderTooltip(event, feature) {
        const { trackModel, onHideTooltip } = this.props;
        const tooltip = (
            <Tooltip pageX={event.pageX} pageY={event.pageY} onClose={onHideTooltip}>
                <div>
                    <div>
                        <span className="Tooltip-major-text" style={{ marginRight: 5 }}>
                            {feature.getName()}
                        </span>
                    </div>
                    <div>Score: {feature.score}</div>
                    <div>
                        {feature.getLocus().toString()} ({feature.getLocus().getLength()}bp)
                    </div>
                    {feature.strand !== "." && <div>strand: {feature.strand}</div>}
                    <div className="Tooltip-minor-text">{trackModel.getDisplayLabel()}</div>
                </div>
            </Tooltip>
        );
        this.props.onShowTooltip(tooltip);
    }

    /**
     * @inheritdoc
     */
    render() {
        const { data, trackModel, options } = this.props;
        const maxScore = data.length ? _.maxBy(data, "score").score : 1;
        this.scales = this.computeScales(maxScore, options.height);
        return (
            <AnnotationTrack
                {...this.props}
                legend={
                    <TrackLegend trackModel={trackModel} height={options.height} axisScale={this.scales.valueToY} />
                }
                featurePadding={0}
                rowHeight={options.height}
                getAnnotationElement={this.renderAnnotation}
            />
        );
    }
}

export default withDefaultOptions(withTooltip(RgbpeakTrack));
