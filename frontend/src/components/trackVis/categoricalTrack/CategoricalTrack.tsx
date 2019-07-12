import React from 'react';

import CategoricalAnnotation from './CategoricalAnnotation';
import { PropsFromTrackContainer } from '../commonComponents/Track';
import AnnotationTrack from '../commonComponents/annotation/AnnotationTrack';
import FeatureDetail from '../commonComponents/annotation/FeatureDetail';
import Tooltip from '../commonComponents/tooltip/Tooltip';
import { withTooltip, TooltipCallbacks } from '../commonComponents/tooltip/withTooltip';
import { Feature } from '../../../model/Feature';
import { PlacedFeatureGroup } from '../../../model/FeatureArranger';
import configOptionMerging from '../commonComponents/configOptionMerging';

export const DEFAULT_OPTIONS = {
    height: 20,
    color: "blue",
    maxRows: 1,
    hiddenPixels: 0.5,
};
const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);

interface CategoricalTrackProps extends PropsFromTrackContainer, TooltipCallbacks {
    data: Feature[];
    options: {
        category: object;
        height?: number;
    }
}

/**
 * Track component for BED annotations.
 * 
 * @author Silas Hsu
 */
class CategoricalTrackNoTooltip extends React.Component<CategoricalTrackProps> {
    static displayName = 'CategoricalTrack';

    constructor(props: CategoricalTrackProps) {
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
            <Tooltip pageX={event.pageX} pageY={event.pageY} onClose={this.props.onHideTooltip} >
                <FeatureDetail feature={feature} category={this.props.options.category} />
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
        const {category, height} = this.props.options;
        return placedGroup.placedFeatures.map((placement, i) => {
            const featureName = placement.feature.getName();
            const color = category && category[featureName] ? category[featureName].color: 'blue';
            return <CategoricalAnnotation
                key={i}
                feature={placement.feature}
                xSpan={placement.xSpan}
                y={y}
                isMinimal={false}
                color={color}
                onClick={this.renderTooltip}
                category={category}
                height={height}
                />;
        }
            
        );
    }

    render() {
        return <AnnotationTrack
            {...this.props}
            rowHeight={this.props.options.height}
            getAnnotationElement={this.renderAnnotation}
        />;
    }
}

export const CategoricalTrack = withDefaultOptions(withTooltip(CategoricalTrackNoTooltip));
