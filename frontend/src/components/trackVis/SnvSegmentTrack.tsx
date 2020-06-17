import React from "react";

import SnvAnnotation from "./SnvAnnotation";
import { PropsFromTrackContainer } from "./commonComponents/Track";
import AnnotationTrack from "./commonComponents/annotation/AnnotationTrack";
import Tooltip from "./commonComponents/tooltip/Tooltip";
import { withTooltip, TooltipCallbacks } from "./commonComponents/tooltip/withTooltip";
import { PlacedFeatureGroup } from "../../model/FeatureArranger";
import configOptionMerging from "./commonComponents/configOptionMerging";
import SnvSegment from "model/SnvSegment";

export const DEFAULT_OPTIONS = {
    hiddenPixels: 0,
    segmentColors: {
        unsequenced: "grey",
        noncoding_insertion: "grey35",
        noncoding_deletion: "grey35",
        noncoding_mismatch: "grey35",
        silent: "grey1",
        frameshift: "red",
        missense: "blue",
        AA_deletion: "blue",
        AA_insertion: "blue",
    },
    maxRows: 1,
    rowHeight: 25,
};
const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);

const ROW_VERTICAL_PADDING = 2;

interface SnvSegmentTrackProps extends PropsFromTrackContainer, TooltipCallbacks {
    data: SnvSegment[];
    options: {
        segmentColors?: object;
        maxRows: number;
        rowHeight: number;
        hiddenPixels: number;
    };
}

/**
 * Track component for BED annotations.
 *
 * @author Silas Hsu
 */
class SnvSegmentTrackNoTooltip extends React.Component<SnvSegmentTrackProps> {
    static displayName = "SnvSegmentTrack";

    constructor(props: SnvSegmentTrackProps) {
        super(props);
        this.renderTooltip = this.renderTooltip.bind(this);
        this.renderAnnotation = this.renderAnnotation.bind(this);
    }

    /**
     * Renders the tooltip for a feature.
     *
     * @param {React.MouseEvent} event - mouse event that triggered the tooltip request
     * @param {SnvSegment} snvsegment - Feature for which to display details
     */
    renderTooltip(event: React.MouseEvent, feature: SnvSegment) {
        const divs: any = [];
        feature.snvData.forEach((seg, idx) => {
            if (seg.length) {
                divs.push(<div key={idx}>{seg}</div>);
            }
        });
        const tooltip = (
            <Tooltip pageX={event.pageX} pageY={event.pageY} onClose={this.props.onHideTooltip}>
                <div>
                    <div>{feature.getLocus().toString()} </div>
                    <div className="font-weight-bold">{feature.snvType}</div>
                    <div>{divs}</div>
                </div>
            </Tooltip>
        );
        this.props.onShowTooltip(tooltip);
    }

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
            <SnvAnnotation
                key={i}
                feature={placement.feature}
                xSpan={placement.xSpan}
                y={y}
                isMinimal={isLastRow}
                segmentColors={this.props.options.segmentColors}
                rowHeight={this.props.options.rowHeight}
                onClick={this.renderTooltip}
            />
        ));
    }

    render() {
        return (
            <AnnotationTrack
                {...this.props}
                rowHeight={this.props.options.rowHeight + ROW_VERTICAL_PADDING}
                getAnnotationElement={this.renderAnnotation}
                featurePadding={-1}
            />
        );
    }
}

export const SnvSegmentTrack = withDefaultOptions(withTooltip(SnvSegmentTrackNoTooltip as any));
