import React from 'react';
import PropTypes from 'prop-types';

import BedAnnotation from './BedAnnotation';
import Track from '../commonComponents/Track';
import AnnotationTrack from '../commonComponents/annotation/AnnotationTrack';
import FeatureDetail from '../commonComponents/annotation/FeatureDetail';
import Tooltip from '../commonComponents/tooltip/Tooltip';
import withTooltip from '../commonComponents/tooltip/withTooltip';

const ROW_VERTICAL_PADDING = 2;
const ROW_HEIGHT = BedAnnotation.HEIGHT + ROW_VERTICAL_PADDING;

/**
 * Track component for BED annotations.
 * 
 * @author Silas Hsu
 */
export class BedTrack extends React.Component {
    static propTypes = Object.assign({}, 
        Track.trackContainerProps,
        withTooltip.INJECTED_PROPS,
        {
        data: PropTypes.array.isRequired // PropTypes.arrayOf(PropTypes.instanceOf(Feature)).isRequired
        }
    );

    static defaultProps = {
        options: {},
        onShowTooltip: element => undefined,
        onHideTooltip: () => undefined,
    };

    constructor(props) {
        super(props);
        this.renderTooltip = this.renderTooltip.bind(this);
        this.renderAnnotation = this.renderAnnotation.bind(this);
    }

    /**
     * Renders the tooltip for a feature.
     * 
     * @param {MouseEvent} event - mouse event that triggered the tooltip request
     * @param {Feature} feature - Feature for which to display details
     */
    renderTooltip(event, feature) {
        const tooltip = (
            <Tooltip pageX={event.pageX} pageY={event.pageY} onClose={this.props.onHideTooltip} >
                <FeatureDetail feature={feature} />
            </Tooltip>
        );
        this.props.onShowTooltip(tooltip);
    }

    /**
     * Renders one annotation.
     * 
     * @param {Feature} feature - feature to render
     * @param {OpenInterval} absInterval - location of the feature in navigation context
     * @param {OpenInterval} xRange - x coordinates the annotation will occupy
     * @param {number} y - y coordinate to render the annotation
     * @param {boolean} isLastRow - whether the annotation is assigned to the last configured row
     * @param {number} index - iteration index
     * @return {JSX.Element} element visualizing the feature
     */
    renderAnnotation(feature, absInterval, xRange, y, isLastRow, index) {
        return <BedAnnotation
            key={index}
            feature={feature}
            xRange={xRange}
            y={y}
            isMinimal={isLastRow}
            color={this.props.options.color}
            onClick={this.renderTooltip}
        />;
    }

    render() {
        return <AnnotationTrack
            {...this.props}
            rowHeight={ROW_HEIGHT}
            getAnnotationElement={this.renderAnnotation}
        />;
    }
}

export default withTooltip(BedTrack);
