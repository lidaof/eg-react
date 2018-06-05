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
import { AnnotationDisplayModes } from '../../model/DisplayModes';

import MethylCRecord from '../../model/MethylCRecord';

import './commonComponents/tooltip/Tooltip.css';

const TOP_PADDING = 5;
const INTERVAL_ARRANGER = new IntervalArranger(0);
const BAR_CHART_STYLE = {paddingTop: TOP_PADDING};
export const DEFAULT_OPTIONS = {
    maxRows: 1,
    height: 40,
    contextColors: MethylCRecord.DEFAULT_CONTEXT_COLORS,
    countColor: MethylCRecord.DEFAULT_COUNT_COLOR,
};
const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);

/**
 * Visualizer for MethylC tracks. 
  * 
 * @author Daofeng Li
 */
class MethylCTrack extends React.PureComponent {
    static propTypes = Object.assign({},
        Track.trackContainerProps,
        withTooltip.INJECTED_PROPS,
        {
        data: PropTypes.array.isRequired, //PropTypes.arrayOf(PropTypes.instanceOf(MethylCRecord)).isRequired,
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
     * @param {MethylCRecord} record - feature to render
     * @param {OpenInterval} absInterval - location of the feature in navigation context
     * @param {OpenInterval} xRange - x coordinates the annotation will occupy
     * @param {any} unused - unused
     * @param {any} unused2 - unused
     * @param {number} index - iteration index
     * @return {JSX.Element} element visualizing the feature
     */
    renderAnnotation(record, absInterval, xRange, unused, unused2, index) {
        if (xRange.getLength() <= 0) {
            return null;
        }
        const {contextColors, countColor, height} = this.props.options;
        const context = record.getContext();
        const color = contextColors[context];

        const y = this.state.valueToY(record.value);
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
            onClick={event => this.renderTooltip(event, record)}
        />;
    }


    /**
     * Renders the tooltip that appears when clicking on a repeat.
     * 
     * @param {MouseEvent} event - mouse click event, used to determine tooltip coordinates
     * @param {MethylCRecord} record - feature containing data to show in the tooltip
     */
    renderTooltip(event, record) {
        const {trackModel, onHideTooltip} = this.props;
        const tooltip = (
            <Tooltip pageX={event.pageX} pageY={event.pageY} onClose={onHideTooltip} >
                <ul style={{margin: 0, padding: '0px 5px 5px', listStyleType: 'none'}} >
                    <li>
                        <span className="Tooltip-major-text" style={{marginRight: 5}} >{record.getContext()}</span>
                    </li>
                    <li>{record.getLocus().toString()}</li>
                    <li>{"Methylation level: " + record.getValue()}</li>
                    <li className="Tooltip-minor-text" >{this.props.trackModel.getDisplayLabel()}</li>
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

export default withDefaultOptions(withTooltip(MethylCTrack));