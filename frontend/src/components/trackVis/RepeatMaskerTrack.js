import React from 'react';
import PropTypes from 'prop-types';
import { scaleLinear } from 'd3-scale';

import Track from './commonComponents/Track';
import AnnotationTrack from './commonComponents/annotation/AnnotationTrack';
import TrackLegend from './commonComponents/TrackLegend';
import Tooltip from './commonComponents/tooltip/Tooltip';
import withTooltip from './commonComponents/tooltip/withTooltip';
import configOptionMerging from './commonComponents/configOptionMerging';

import IntervalArranger from '../../model/interval/IntervalArranger';
import RepeatMaskerFeature from '../../model/RepeatMaskerFeature';
import { AnnotationDisplayModes } from '../../model/DisplayModes';

import './commonComponents/tooltip/Tooltip.css';

const TOP_PADDING = 3;
const INTERVAL_ARRANGER = new IntervalArranger(0);
export const DEFAULT_OPTIONS = {
    maxRows: 1,
    height: 40,
    categoryColors: RepeatMaskerFeature.DEFAULT_CLASS_COLORS,
    displayMode: AnnotationDisplayModes.FULL,
};
const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);

/**
 * RepeatMasker track.
 * Although rmsk uses bigbed as data source, but rmsk has much more contents to be draw so was separated from basic
 * bigbed.
 * 
 * @author Daofeng Li
 * @author Silas Hsu
 */
class RepeatTrack extends React.PureComponent {
    static propTypes = Object.assign({},
        Track.trackContainerProps,
        withTooltip.INJECTED_PROPS,
        {
        data: PropTypes.array.isRequired, //PropTypes.arrayOf(PropTypes.instanceOf(RepeatMaskerFeature)).isRequired,
        }
    );

    constructor(props) {
        super(props);
        this.state = this.makeScale(props);
        this.renderAnnotation = this.renderAnnotation.bind(this);
        this.renderTooltip = this.renderTooltip.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.options !== nextProps.options) {
            this.setState(this.makeScale(nextProps))
        }
    }

    makeScale(props) {
        return {valueToY: scaleLinear().domain([1, 0]).range([TOP_PADDING, props.options.height])}
    }

    /**
     * Renders one bar.
     * 
     * @param {RepeatMaskerFeature} repeatFeature - feature to render
     * @param {OpenInterval} absInterval - location of the feature in navigation context
     * @param {OpenInterval} xRange - x coordinates the annotation will occupy
     * @param {any} unused - unused
     * @param {any} unused2 - unused
     * @param {number} index - iteration index
     * @return {JSX.Element} element visualizing the feature
     */
    renderAnnotation(repeatFeature, absInterval, xRange, unused, unused2, index) {
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

        return <rect
            key={index}
            x={xRange.start}
            y={y}
            width={xRange.getLength()}
            height={drawHeight}
            fill={color}
            fillOpacity={0.75}
            onClick={event => this.renderTooltip(event, repeatFeature)}
        />;
    }

    /**
     * Renders the tooltip that appears when clicking on a repeat.
     * 
     * @param {MouseEvent} event - mouse click event, used to determine tooltip coordinates
     * @param {RepeatMaskerFeature} feature - feature containing data to show in the tooltip
     */
    renderTooltip(event, feature) {
        const {trackModel, onHideTooltip} = this.props;
        const tooltip = (
            <Tooltip pageX={event.pageX} pageY={event.pageY} onClose={onHideTooltip} >
                <ul style={{margin: 0, padding: '0px 5px 5px', listStyleType: 'none'}} >
                    <li>
                        <span className="Tooltip-major-text" style={{marginRight: 5}} >{feature.getName()}</span>
                        <span className="Tooltip-minor-text" >{feature.getClassDetails()}</span>
                    </li>
                    <li>{`${feature.getLocus().toString()} (${feature.getLocus().getLength()}bp)`}</li>
                    <li>{"(1 - divergence%) = " + feature.value.toFixed(2)}</li>
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
            legend={<TrackLegend trackModel={trackModel} height={options.height} axisScale={this.state.valueToY} />}
            intervalArranger={INTERVAL_ARRANGER}
            rowHeight={options.height}
            getAnnotationElement={this.renderAnnotation}
        />;
    }
}

export default withDefaultOptions(withTooltip(RepeatTrack));
