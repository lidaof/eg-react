import React from "react";

import PairwiseAnnotation from "./PairwiseAnnotation";
import { PropsFromTrackContainer } from "./commonComponents/Track";
import AnnotationTrack from "./commonComponents/annotation/AnnotationTrack";
import Tooltip from "./commonComponents/tooltip/Tooltip";
import { withTooltip, TooltipCallbacks } from "./commonComponents/tooltip/withTooltip";
import { Feature } from "../../model/Feature";
import { PlacedFeatureGroup } from "../../model/FeatureArranger";
import configOptionMerging from "./commonComponents/configOptionMerging";

export const DEFAULT_OPTIONS = {
    hiddenPixels: 0,
    segmentColors: {
        deletion: "#bc8f8f",
        insertion: "blue",
        mismatch: {
            A: "#89c738",
            T: "#9238c7",
            C: "#e05144",
            G: "#3899c7",
            N: "#858585",
        },
    },
    maxRows: 1,
};
const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);

const ROW_VERTICAL_PADDING = 2;
const ROW_HEIGHT = PairwiseAnnotation.HEIGHT + ROW_VERTICAL_PADDING;

interface PairwiseSegmentTrackProps extends PropsFromTrackContainer, TooltipCallbacks {
    data: Feature[];
    options: {
        segmentColors?: object;
    };
}

/**
 * Track component for BED annotations.
 *
 * @author Silas Hsu
 */
class PairwiseSegmentTrackNoTooltip extends React.Component<PairwiseSegmentTrackProps> {
    static displayName = "PairwiseSegmentTrack";

    constructor(props: PairwiseSegmentTrackProps) {
        super(props);
        this.renderTooltip = this.renderTooltip.bind(this);
        this.renderAnnotation = this.renderAnnotation.bind(this);
    }

    /**
     * Renders the tooltip for a feature.
     *
     * @param {React.MouseEvent} event - mouse event that triggered the tooltip request
     * @param {Feature} feature - Feature for which to display details
     */
    renderTooltip(event: React.MouseEvent, feature: Feature) {
        const tooltip = (
            <Tooltip pageX={event.pageX} pageY={event.pageY} onClose={this.props.onHideTooltip}>
                <div>
                    <div>{feature.getLocus().toString()} </div>
                    <div>
                        {(feature as any).segment.type}: {(feature as any).segment.value}
                    </div>
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
            <PairwiseAnnotation
                key={i}
                feature={placement.feature}
                xSpan={placement.xSpan}
                y={y}
                isMinimal={isLastRow}
                segmentColors={this.props.options.segmentColors}
                onClick={this.renderTooltip}
            />
        ));
    }

    render() {
        return (
            <AnnotationTrack
                {...this.props}
                rowHeight={ROW_HEIGHT}
                getAnnotationElement={this.renderAnnotation}
                featurePadding={-1}
            />
        );
    }
}

export const PairwiseSegmentTrack = withDefaultOptions(withTooltip(PairwiseSegmentTrackNoTooltip as any));
