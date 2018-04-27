import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { scaleLinear } from 'd3-scale';

import Track from './commonComponents/Track';
import AnnotationTrack from './commonComponents/annotation/AnnotationTrack';
import TrackLegend from './commonComponents/TrackLegend';
import Tooltip from './commonComponents/tooltip/Tooltip';
import configOptionMerging from './commonComponents/configOptionMerging';
import { configStaticDataSource } from './commonComponents/configDataFetch';
import withTooltip from './commonComponents/tooltip/withTooltip';

import { BackgroundColorConfig } from './contextMenu/ColorConfig';

import RepeatMaskerFeature from '../../model/RepeatMaskerFeature';
import BigWigOrBedSource from '../../dataSources/BigWigOrBedSource';

import './commonComponents/tooltip/Tooltip.css';

const TOP_PADDING = 5;
const DEFAULT_OPTIONS = {
    height: 40,
    rows: 1,
    categoryColors: RepeatMaskerFeature.DEFAULT_CLASS_COLORS,
};

/**
 * Converter of DASFeatures to RepeatMaskerFeatures.
 * 
 * @param {DASFeature[]} data - DASFeatures to convert
 * @return {RepeatMaskerFeature[]} RepeatMaskerFeatures made from the input
 */
function formatDasFeatures(data) {
    return data.map(feature => new RepeatMaskerFeature(feature))
}

const withOptionMerging = configOptionMerging(DEFAULT_OPTIONS);
const withDataFetch = configStaticDataSource(props => new BigWigOrBedSource(props.trackModel.url), formatDasFeatures);
const configure = _.flowRight([withOptionMerging, withDataFetch, withTooltip]);

/**
 * RepeatMasker track.
 * Although rmsk uses bigbed as data source, but rmsk has much more contents to be draw so was separated from basic
 * bigbed.
 * 
 * @author Daofeng Li
 * @author Silas Hsu
 */
class RepeatTrack extends React.Component {
    static propTypes = Object.assign({},
        Track.trackContainerProps,
        configOptionMerging.INJECTED_PROPS,
        configStaticDataSource.INJECTED_PROPS,
        withTooltip.INJECTED_PROPS,
        {
        data: PropTypes.arrayOf(PropTypes.instanceOf(RepeatMaskerFeature)).isRequired, // RepeatMaskerFeature to render
        }
    );

    constructor(props) {
        super(props);
        this.state = {
            valueToY: null
        };
        this.renderAnnotation = this.renderAnnotation.bind(this);
        this.renderTooltip = this.renderTooltip.bind(this);
    }

    /**
     * Gets the scale to use from props.
     * 
     * @param {Object} nextProps - next props the Track will receive
     * @return {Object} next state to merge
     */
    static getDerivedStateFromProps(nextProps) {
        return {
            valueToY: scaleLinear().domain([1, 0]).range([TOP_PADDING, nextProps.options.height])
        };
    }

    /**
     * Renders one bar.
     * 
     * @param {RepeatMaskerFeature} repeatFeature - feature to render
     * @param {OpenInterval} absInterval - location of the feature in navigation context
     * @param {OpenInterval} xRange - x coordinates the annotation will occupy
     * @return {JSX.Element} element visualizing the feature
     */
    renderAnnotation(repeatFeature, absInterval, xRange) {
        if (xRange.getLength() <= 0) {
            return null;
        }
        const {categoryColors, height} = this.props.options;
        const categoryId = repeatFeature.getCategoryId();
        const color = categoryColors[categoryId];

        const y = this.state.valueToY(repeatFeature.value);
        const drawHeight = height - y;
        if (drawHeight <= 0) {
            return null;
        }

        const x = xRange.start;
        return <rect
            key={x}
            x={x}
            y={y}
            width={xRange.getLength()}
            height={drawHeight}
            fill={color}
            onClick={event => this.renderTooltip(event, repeatFeature)}
        />;
    }

    /**
     * Renders the tooltip that appears when clicking on a repeat.
     * 
     * @param {MouseEvent} event - mouse click event, used to determine tooltip coordinates
     * @param {RepeatMaskerFeature} repeatFeature - feature containing data to show in the tooltip
     */
    renderTooltip(event, repeatFeature) {
        const {trackModel, onHideTooltip} = this.props;
        const tooltip = (
            <Tooltip pageX={event.pageX} pageY={event.pageY} onClose={onHideTooltip} >
                <ul style={{margin: 0, padding: '0px 5px 5px', listStyleType: 'none'}} >
                    <li>
                        <span className="Tooltip-major-text" style={{marginRight: 5}} >{repeatFeature.getName()}</span>
                        <span className="Tooltip-minor-text" >{repeatFeature.getClassDetails()}</span>
                    </li>
                    <li>{repeatFeature.getLocus().toString()}</li>
                    <li>{"(1 - divergence%) = " + repeatFeature.value.toFixed(2)}</li>
                    <li className="Tooltip-minor-text" >{trackModel.getDisplayLabel()}</li>
                </ul>
            </Tooltip>
        );
        this.props.onShowTooltip(tooltip);
    }

    /** 
     * @inheritdoc
     */
    render() {
        const {trackModel, options} = this.props;
        return <AnnotationTrack
            {...this.props}
            legend={<TrackLegend trackModel={trackModel} height={options.height} scaleForAxis={this.state.valueToY} />}
            rowHeight={options.height}
            getAnnotationElement={this.renderAnnotation}
        />;
    }
}

const RepeatMaskerConfig = {
    component: configure(RepeatTrack),
    menuItems: [BackgroundColorConfig],
    defaultOptions: DEFAULT_OPTIONS,
};

export default RepeatMaskerConfig;
