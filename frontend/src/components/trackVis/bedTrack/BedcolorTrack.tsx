import React from "react";
import Bedcolor from "./Bedcolor";
import { PropsFromTrackContainer } from "../commonComponents/Track";
import AnnotationTrack from "../commonComponents/annotation/AnnotationTrack";
import FeatureDetail from "../commonComponents/annotation/FeatureDetail";
import Tooltip from "../commonComponents/tooltip/Tooltip";
import { withTooltip, TooltipCallbacks } from "../commonComponents/tooltip/withTooltip";
import { ColoredFeature } from "../../../model/Feature";
import { PlacedFeatureGroup } from "../../../model/FeatureArranger";

const ROW_VERTICAL_PADDING = 2

interface BedcolorTrackProps extends PropsFromTrackContainer, TooltipCallbacks {
    data: ColoredFeature[];
    options: {
        rowHeight: number,
        hiddenPixels: number,
    };
}

export const DEFAULT_OPTIONS = {
    rowHeight: 40,
    hiddenPixels: 0,
}

/**
 * Track component for BED annotations.
 *
 * @author Silas Hsu
 */
class BedcolorTrackNoTooltip extends React.Component<BedcolorTrackProps> {
    static displayName = "BedcolorTrack";

    constructor(props: BedcolorTrackProps) {
        super(props);
        this.renderTooltip = this.renderTooltip.bind(this);
        this.renderAnnotation = this.renderAnnotation.bind(this);
    }

    /**
     * Renders the tooltip for a feature.
     *
     * @param {React.MouseEvent} event - mouse event that triggered the tooltip request
     * @param {ColoredFeature} feature - Feature for which to display details
     */
    renderTooltip(event: React.MouseEvent, feature: ColoredFeature) {
        const tooltip = (
            <Tooltip pageX={event.pageX} pageY={event.pageY} onClose={this.props.onHideTooltip}>
                <FeatureDetail feature={feature} />
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
            <Bedcolor
                key={i}
                feature={placement.feature}
                xSpan={placement.xSpan}
                y={y}
                isMinimal={isLastRow}
                height={this.props.options.rowHeight}
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
                featurePadding={0}
            />
        );
    }
}

export const BedcolorTrack = withTooltip(BedcolorTrackNoTooltip as any);
