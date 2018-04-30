import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import BedAnnotation from './BedAnnotation';
import Track from '../commonComponents/Track';
import AnnotationTrack, { SUGGESTED_MENU_ITEMS } from '../commonComponents/annotation/AnnotationTrack';
import FeatureDetail from '../commonComponents/annotation/FeatureDetail';
import Tooltip from '../commonComponents/tooltip/Tooltip';
import withTooltip from '../commonComponents/tooltip/withTooltip';
import configOptionMerging from '../commonComponents/configOptionMerging';
import { configStaticDataSource } from '../commonComponents/configDataFetch';

import BedSource from '../../../dataSources/BedSource';
import Feature from '../../../model/Feature';
import ChromosomeInterval from '../../../model/interval/ChromosomeInterval';

const BedColumnIndices = {
    NAME: 3,
    SCORE: 4,
    STRAND: 5,
};

const DEFAULT_OPTIONS = {
    color: "blue",
    rows: 5,
};

/**
 * Converts BedRecords to Features.
 * 
 * @param {BedRecord[]} data - bed records to convert
 * @return {Feature[]} bed records in the form of Feature
 */
function formatBedRecords(data) {
    return data.map(record => new Feature(
        // "." is a placeholder that means "undefined" in the bed file.
        record[BedColumnIndices.NAME] === "." ? "" : record[BedColumnIndices.NAME],
        new ChromosomeInterval(record.chr, record.start, record.end),
        record[BedColumnIndices.STRAND]
    ));
}

const withOptionMerging = configOptionMerging(DEFAULT_OPTIONS);
const withDataFetch = configStaticDataSource(props => new BedSource(props.trackModel.url), formatBedRecords);
const configure = _.flowRight([withOptionMerging, withDataFetch, withTooltip]);

/**
 * Track component for BED annotations.
 * 
 * @author Silas Hsu
 */
export class BedTrack extends React.Component {
    static propTypes = Object.assign({}, 
        Track.trackContainerProps,
        configOptionMerging.INJECTED_PROPS,
        configStaticDataSource.INJECTED_PROPS,
        withTooltip.INJECTED_PROPS,
        {
        data: PropTypes.arrayOf(PropTypes.instanceOf(Feature)).isRequired, // Features to render
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
            rowHeight={BedAnnotation.HEIGHT + 2}
            getHorizontalPadding={5}
            getAnnotationElement={this.renderAnnotation}
        />;
    }
}

export const BedTrackConfig = {
    component: configure(BedTrack),
    menuItems: SUGGESTED_MENU_ITEMS,
    defaultOptions: DEFAULT_OPTIONS,
};

export default BedTrackConfig;
