import React from "react";
import PropTypes from "prop-types";
import { scaleLinear } from "d3-scale";
import _ from "lodash";
import { TranslatableG } from "../../TranslatableG";
import Tooltip from "../commonComponents/tooltip/Tooltip";
import { FiberDisplayModes } from "model/DisplayModes";
import AnnotationArrows from "../commonComponents/annotation/AnnotationArrows";

const DOT_BP_PIXEL_CUTOFF = 2.5;

/**
 * Visualizer for fiber.
 *
 */
class FiberAnnotation extends React.Component {
    static propTypes = {
        // placement: PropTypes.instanceOf(PlacedFeature).isRequired, // fiber segment to visualize
        placement: PropTypes.object.isRequired, // fiber segment to visualize
        y: PropTypes.number, // Y offset
        color: PropTypes.string, // Primary color to draw
        color2: PropTypes.string, // Color of reverse strand annotations
        rowHeight: PropTypes.number,
        isMinimal: PropTypes.bool, // Whether to just render a plain box
        displayMode: PropTypes.string,
        /**
         * Callback for click events.  Signature: (event: MouseEvent, feature: Feature): void
         *     `event`: the triggering click event
         *     `feature`: the same Feature as the one passed via props
         */
        onShowTooltip: PropTypes.func,
        onHideTooltip: PropTypes.func,
    };

    /**
     * Renders the tooltip for an element in a fiber.
     */
    renderTooltip = (event, feature, bs) => {
        const tooltip = (
            <Tooltip pageX={event.pageX} pageY={event.pageY} ignoreMouse={true}>
                <div>
                    {bs && `position ${bs} in`} {feature.getName()} read
                </div>
            </Tooltip>
        );
        this.props.onShowTooltip(tooltip);
    };

    /**
     * Renders the bar tooltip in a fiber.
     */
    renderBarTooltip = (event, feature, onCount, onPct, total) => {
        const tooltip = (
            <Tooltip pageX={event.pageX} pageY={event.pageY} ignoreMouse={true}>
                <div>
                    {onCount}/{total} ({`${(onPct * 100).toFixed(2)}%`})
                </div>
                <div>{feature.getName()}</div>
            </Tooltip>
        );
        this.props.onShowTooltip(tooltip);
    };

    render() {
        const {
            placement,
            y,
            color,
            color2,
            isMinimal,
            hiddenPixels,
            rowHeight,
            onHideTooltip,
            displayMode,
            hideMinimalItems,
            pixelsPadding,
        } = this.props;
        const { feature, xSpan, visiblePart } = placement;
        const { relativeStart, relativeEnd } = visiblePart;
        const segmentWidth = relativeEnd - relativeStart;
        const [startX, endX] = xSpan;
        const width = endX - startX;
        if (width < hiddenPixels) {
            return null;
        }
        if (isMinimal) {
            if (hideMinimalItems) {
                return null;
            }
            return (
                <TranslatableG
                    y={y}
                    onMouseEnter={(event) => this.renderTooltip(event, feature)}
                    onMouseOut={onHideTooltip}
                >
                    <rect x={startX} y={0} width={width} height={rowHeight} fill={color} opacity={0.2} />
                </TranslatableG>
            );
        }
        const bpPixel = (1 / segmentWidth) * width;
        if (bpPixel < DOT_BP_PIXEL_CUTOFF) {
            const mainBody =
                displayMode === FiberDisplayModes.AUTO ? (
                    <rect x={startX} y={rowHeight} width={width} height={1} fill="gray" opacity={0.5} />
                ) : null;
            const intWidth = Math.round(width);
            const xMap = Array(intWidth).fill(null); // relative x from 0 to width, like in feature aggregator
            for (let x = 0; x < intWidth; x++) {
                xMap[x] = { on: 0, off: 0 };
            }
            feature.ons.forEach((rbs) => {
                const bs = Math.abs(rbs);
                if (bs >= relativeStart && bs < relativeEnd) {
                    const x = Math.floor(((bs - relativeStart) / segmentWidth) * width);
                    if (x < intWidth) {
                        xMap[x].on += 1;
                    }
                }
            });
            feature.offs.forEach((rbs) => {
                const bs = Math.abs(rbs);
                if (bs >= relativeStart && bs < relativeEnd) {
                    const x = Math.floor(((bs - relativeStart) / segmentWidth) * width);
                    if (x < intWidth) {
                        xMap[x].off += 1;
                    }
                }
            });
            const totals = xMap.map((x) => x.on + x.off);
            const maxValue = _.max(totals);
            const pcts = xMap.map((x, i) => x.on / totals[i]);
            const bars = [];
            const barWidth = Math.max(bpPixel, 1);
            const scale = scaleLinear().domain([0, 1]).range([0, rowHeight]).clamp(true);
            const bgScale = scaleLinear().range([0.2, 0.9]).domain([0, maxValue]).clamp(true);
            xMap.forEach((x, idx) => {
                if (x.on || x.off) {
                    // if (x.on) {
                    if (displayMode === FiberDisplayModes.AUTO) {
                        bars.push(
                            <rect
                                key={idx + "bgbar"}
                                x={startX + idx}
                                y={0}
                                height={rowHeight}
                                width={barWidth + pixelsPadding}
                                fill="lightgray"
                                opacity={bgScale(totals[idx])}
                            />
                        );
                        const barHeight = scale(pcts[idx]);
                        bars.push(
                            <rect
                                key={idx + "fgbar"}
                                x={startX + idx}
                                y={rowHeight - barHeight}
                                height={barHeight}
                                width={barWidth + pixelsPadding}
                                fill={color}
                                opacity={0.7}
                                onMouseEnter={(event) =>
                                    this.renderBarTooltip(event, feature, x.on, pcts[idx], totals[idx])
                                }
                                onMouseOut={onHideTooltip}
                            />
                        );
                    } else {
                        // bar heatmap
                        const fillColor = pcts[idx] >= 0.5 ? color : color2;
                        // const opacity = pcts[idx] >= 0.5 ? 1 : 0.3;
                        bars.push(
                            <rect
                                key={idx + "fgrect"}
                                x={startX + idx}
                                y={0}
                                height={rowHeight}
                                width={barWidth + pixelsPadding}
                                // width={10}
                                fill={fillColor}
                                opacity={1}
                                // opacity={opacity}
                                onMouseEnter={(event) =>
                                    this.renderBarTooltip(event, feature, x.on, pcts[idx], totals[idx])
                                }
                                onMouseOut={onHideTooltip}
                            />
                        );
                    }
                }
            });

            return (
                <TranslatableG y={y}>
                    {mainBody}
                    {bars}
                </TranslatableG>
            );
        } else {
            // bp level
            const mainBody = <rect x={startX} y={rowHeight * 0.5} width={width} height={1} fill="gray" opacity={0.5} />;
            const arrows = feature.strand !== "." && (
                <AnnotationArrows
                    startX={xSpan.start}
                    endX={xSpan.end}
                    y={rowHeight * 0.25}
                    height={rowHeight * 0.5}
                    opacity={0.75}
                    isToRight={feature.strand !== "-"}
                    color="grey"
                    separation={100}
                />
            );
            const blocks = [];
            feature.ons.forEach((rbs, idx) => {
                const bs = Math.abs(rbs);
                if (bs >= relativeStart && bs < relativeEnd) {
                    const fillColor = rbs > 0 ? color : color2;
                    if (displayMode === FiberDisplayModes.AUTO) {
                        const radius = Math.min(Math.max(bpPixel * 0.5, 2), rowHeight * 0.5);
                        const blockStart = startX + ((bs - relativeStart + 0.5) / segmentWidth) * width;
                        const cy = rbs > 0 ? 0.4 * rowHeight : 0.6 * rowHeight;
                        blocks.push(
                            <circle
                                key={idx + "fg"}
                                cx={blockStart}
                                cy={cy}
                                r={radius}
                                fill={fillColor}
                                stroke={fillColor}
                                strokeWidth={2}
                                opacity={0.7}
                                onMouseEnter={(event) => this.renderTooltip(event, feature, bs)}
                                onMouseOut={onHideTooltip}
                            />
                        );
                    } else {
                        const rwidth = Math.max(1, bpPixel);
                        const x = startX + ((bs - relativeStart) / segmentWidth) * width;
                        const y = rbs > 0 ? 0 : 0.5 * rowHeight;
                        blocks.push(
                            <rect
                                key={idx + "fg"}
                                x={x}
                                y={y}
                                height={rowHeight * 0.5}
                                width={rwidth}
                                fill={fillColor}
                                strokeWidth={0}
                                opacity={0.6}
                                onMouseEnter={(event) => this.renderTooltip(event, feature, bs)}
                                onMouseOut={onHideTooltip}
                            />
                        );
                    }
                }
            });
            feature.offs.forEach((rbs, idx) => {
                const bs = Math.abs(rbs);
                if (bs >= relativeStart && bs < relativeEnd) {
                    if (displayMode === FiberDisplayModes.AUTO) {
                        const fillColor = rbs > 0 ? color : color2;
                        const radius = Math.min(Math.max(bpPixel * 0.5, 2), rowHeight * 0.5);
                        const blockStart = startX + ((bs - relativeStart + 0.5) / segmentWidth) * width;
                        const cy = rbs > 0 ? 0.4 * rowHeight : 0.6 * rowHeight;
                        blocks.push(
                            <circle
                                key={idx + "bg"}
                                cx={blockStart}
                                cy={cy}
                                r={radius}
                                fill={fillColor}
                                stroke={fillColor}
                                strokeWidth={2}
                                fillOpacity={0}
                                opacity={0.7}
                                onMouseEnter={(event) => this.renderTooltip(event, feature, bs)}
                                onMouseOut={onHideTooltip}
                            />
                        );
                    } else {
                        const rwidth = Math.max(1, bpPixel);
                        const x = startX + ((bs - relativeStart) / segmentWidth) * width;
                        const y = rbs > 0 ? 0 : 0.5 * rowHeight;
                        blocks.push(
                            <rect
                                key={idx + "bg"}
                                x={x}
                                y={y}
                                height={rowHeight * 0.5}
                                width={rwidth}
                                fill="lightgrey"
                                strokeWidth={0}
                                opacity={0.5}
                                onMouseEnter={(event) => this.renderTooltip(event, feature, bs)}
                                onMouseOut={onHideTooltip}
                            />
                        );
                    }
                }
            });

            return (
                <TranslatableG y={y}>
                    {mainBody}
                    {arrows}
                    {blocks}
                </TranslatableG>
            );
        }
    }
}

export default FiberAnnotation;
