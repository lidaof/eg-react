import React from 'react';

import SnpAnnotation from './SnpAnnotation';
import { PropsFromTrackContainer } from '../commonComponents/Track';
import AnnotationTrack from '../commonComponents/annotation/AnnotationTrack';
import Tooltip from '../commonComponents/tooltip/Tooltip';
import { withTooltip, TooltipCallbacks } from '../commonComponents/tooltip/withTooltip';
import { PlacedFeatureGroup } from '../../../model/FeatureArranger';
import SnpDetail from './SnpDetail';
import Snp from '../../../model/Snp';

export const DEFAULT_OPTIONS = {
    options: {maxRows: 20},
    height: 40,
}

const ROW_VERTICAL_PADDING = 2;
const ROW_HEIGHT = SnpAnnotation.HEIGHT + ROW_VERTICAL_PADDING;

interface SnpTrackProps extends PropsFromTrackContainer, TooltipCallbacks {
    data: Snp[];
    options: {
        color?: string;
        color2?: string;
    }
}

/**
 * Track component for BED annotations.
 * 
 * @author Silas Hsu
 */
class SnpTrackNoTooltip extends React.Component<SnpTrackProps> {
    static displayName = 'SnpTrack';

    constructor(props: SnpTrackProps) {
        super(props);
        this.renderTooltip = this.renderTooltip.bind(this);
        this.renderAnnotation = this.renderAnnotation.bind(this);
    }

    /**
     * Renders the tooltip for a snp.
     * 
     * @param {React.MouseEvent} event - mouse event that triggered the tooltip request
     * @param {Snp} snp - Feature for which to display details
     */
    renderTooltip(event: React.MouseEvent, snp: Snp) {
        const tooltip = (
            <Tooltip pageX={event.pageX} pageY={event.pageY} onClose={this.props.onHideTooltip} >
                <SnpDetail snp={snp} />
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
        return placedGroup.placedFeatures.map((placement, i) =>
            <SnpAnnotation
                key={i}
                snp={placement.feature}
                xSpan={placement.xSpan}
                y={y}
                isMinimal={isLastRow}
                color={this.props.options.color}
                reverseStrandColor={this.props.options.color2}
                isInvertArrowDirection={placement.isReverse}
                onClick={this.renderTooltip}
            />
        );
    }

    render() {
        const message = this.props.data.length > 0 ? null : 
            <div className="Track-message">Please zoom in to see track contents</div>;
        return <AnnotationTrack
            {...this.props}
            rowHeight={ROW_HEIGHT}
            getAnnotationElement={this.renderAnnotation}
            message={message}
        />;
    }
}

export const SnpTrack = withTooltip(SnpTrackNoTooltip);
