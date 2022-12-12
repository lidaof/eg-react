import React from "react";

import FiberAnnotation from "./FiberAnnotation";
import { PropsFromTrackContainer } from "../commonComponents/Track";
import AnnotationTrack from "../commonComponents/annotation/AnnotationTrack";
import FeatureDetail from "../commonComponents/annotation/FeatureDetail";
import Tooltip from "../commonComponents/tooltip/Tooltip";
import { withTooltip, TooltipCallbacks } from "../commonComponents/tooltip/withTooltip";
import { Fiber } from "../../../model/Feature";
import { PlacedFeatureGroup } from "../../../model/FeatureArranger";
import OpenInterval from "model/interval/OpenInterval";
import configOptionMerging from "../commonComponents/configOptionMerging";

const ROW_VERTICAL_PADDING = 2;
const ROW_HEIGHT = FiberAnnotation.HEIGHT + ROW_VERTICAL_PADDING;

interface FiberTrackProps extends PropsFromTrackContainer, TooltipCallbacks {
    data: Fiber[];
    options: {
        color?: string;
        color2?: string;
        alwaysDrawLabel?: boolean;
        hiddenPixels?: number;
    };
}

export const DEFAULT_OPTIONS = {
    hiddenPixels: 0.5,
}

const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);

/**
 * Track component for BED annotations.
 *
 * @author Silas Hsu
 */
class FiberTrackNoTooltip extends React.Component<FiberTrackProps> {
    static displayName = "FiberTrack";

    constructor(props: FiberTrackProps) {
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
    renderTooltip(event: React.MouseEvent, feature: Fiber) {
        const tooltip = (
            <Tooltip pageX={event.pageX} pageY={event.pageY} onClose={this.props.onHideTooltip}>
                <FeatureDetail feature={feature} />
            </Tooltip>
        );
        this.props.onShowTooltip(tooltip);
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
                fiber={placement.feature}
                xSpan={placement.xSpan}
                y={y}
                isMinimal={isLastRow}
                color={this.props.options.color}
                reverseStrandColor={this.props.options.color2}
                isInvertArrowDirection={placement.isReverse}
                onClick={this.renderTooltip}
                alwaysDrawLabel={this.props.options.alwaysDrawLabel}
                hiddenPixels={this.props.options.hiddenPixels}
            />
        ));
    }

    render() {
        return (
            <AnnotationTrack
                {...this.props}
                rowHeight={ROW_HEIGHT}
                getAnnotationElement={this.renderAnnotation}
                featurePadding={this.paddingFunc}
            />
        );
    }
}

export const FiberTrack = withDefaultOptions(withTooltip(FiberTrackNoTooltip as any));
