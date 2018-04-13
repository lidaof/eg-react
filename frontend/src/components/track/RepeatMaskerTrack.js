import React from 'react';

import BigWigTrack from './BigWigTrack';
import BarPlot from './BarPlot';
import HiddenItemsMessage from './HiddenItemsMessage';
import { VISUALIZER_PROP_TYPES } from './Track';
import { BackgroundColorConfig } from './contextMenu/ColorConfig';

import RepeatMaskerRecord from '../../model/RepeatMaskerRecord';
import LinearDrawingModel from '../../model/LinearDrawingModel';
import BigWigOrBedSource from '../../dataSources/BigWigOrBedSource';
import { CategoricalBarElementFactory } from '../../art/BarElementFactory';
import { RenderTypes } from '../../art/DesignRenderer';

import './Tooltip.css';

const TOP_PADDING = 5;
const BAR_CHART_STYLE = {paddingTop: TOP_PADDING};
const DEFAULT_OPTIONS = {
    height: 40,
    categoryColors: RepeatMaskerRecord.DEFAULT_CLASS_COLORS,
};

/**
 * From the raw data source records, filters repeats too small to see.
 * 
 * @param {Object[]} records - raw plain-object records
 * @param {Object} trackProps - props passed to Track
 * @return {Object} object with keys `repeats` and `numHidden`.  See doc above for details
 */
function processRepeats(records, trackProps) {
    const drawModel = new LinearDrawingModel(trackProps.viewRegion, trackProps.width);
    const visibleRecords = records.filter(record => drawModel.basesToXWidth(record.max - record.min) >= 0.25);
    return {
        repeats: visibleRecords.map(record => new RepeatMaskerRecord(record)),
        numHidden: records.length - visibleRecords.length
    };
}

/**
 * Visualizer for RepeatMasker tracks. 
 * Although rmsk uses bigbed as data source, but rmsk has much more contents to be draw so was separated from basic bigbed
 * be aware of bigbed track might also need specify number of columns?
 * 
 * @author Daofeng Li
 */
class RepeatVisualizer extends React.PureComponent {
    static propTypes = VISUALIZER_PROP_TYPES;

    /**
     * @inheritdoc
     */
    constructor(props) {
        super(props);
        this.state = {
            elementFactory: new CategoricalBarElementFactory(props.options.height, props.options),
        };
        this.getTooltipContents = this.getTooltipContents.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.options !== nextProps.options) {
            this.setState({
                elementFactory: new CategoricalBarElementFactory(nextProps.options.height, nextProps.options)
            });
        }
    }

    getTooltipContents(relativeX, record) {
        if (!record) {
            return null;
        }
        return (
        <ul style={{margin: 0, padding: '0px 5px 5px', listStyleType: 'none'}} >
            <li>
                <span className="Tooltip-major-text" style={{marginRight: 5}} >{record.getName()}</span>
                <span className="Tooltip-minor-text" >{record.getClassDetails()}</span>
            </li>
            <li>{record.getLocus().toString()}</li>
            <li>{"(1 - divergence%) = " + record.getValue().toFixed(2)}</li>
            <li className="Tooltip-minor-text" >{this.props.trackModel.getDisplayLabel()}</li>
        </ul>
        );
    }

    /** 
     * @inheritdoc
     */
    render() {
        const {data, viewRegion, width, options} = this.props;
        return (
        <React.Fragment>
            <BarPlot
                viewRegion={viewRegion}
                data={data.repeats || []}
                width={width}
                height={options.height}
                elementFactory={this.state.elementFactory}
                style={BAR_CHART_STYLE}
                type={RenderTypes.CANVAS}
                getTooltipContents={this.getTooltipContents}
            />
            <HiddenItemsMessage width={width} numHidden={data.numHidden} />
        </React.Fragment>
        );
    }
}

const RepeatMaskerTrack = {
    visualizer: RepeatVisualizer,
    legend: (props) => <BigWigTrack.legend {...props} data={props.data.repeats || []} />,
    menuItems: [BackgroundColorConfig],
    defaultOptions: DEFAULT_OPTIONS,
    getDataSource: trackModel => new BigWigOrBedSource(trackModel.url),
    processData: processRepeats
};

export default RepeatMaskerTrack;
