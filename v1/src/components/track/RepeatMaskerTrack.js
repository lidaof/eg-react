import React from 'react';

import BigWigTrack from './BigWigTrack';
import BarPlot from './BarPlot';
import { VISUALIZER_PROP_TYPES } from './Track';
import { BackgroundColorConfig } from './contextMenu/ColorConfig';

import RepeatMaskerRecord from '../../model/RepeatMaskerRecord';
import BigWigOrBedSource from '../../dataSources/BigWigOrBedSource';
import DataFormatter from '../../dataSources/DataFormatter';
import { CategoricalBarElementFactory } from '../../art/BarElementFactory';
import { RenderTypes } from '../../art/DesignRenderer';

import './Tooltip.css';

const TOP_PADDING = 5;
const BAR_CHART_STYLE = {paddingTop: TOP_PADDING};
const DEFAULT_OPTIONS = {
    height: 40,
    categoryColors: RepeatMaskerRecord.DEFAULT_CLASS_COLORS,
};

class RepeatMaskerFormatter extends DataFormatter {
    format(data) {
        return data.map(feature => new RepeatMaskerRecord(feature));
    }
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
        <BarPlot
            viewRegion={viewRegion}
            data={data}
            width={width}
            height={options.height}
            elementFactory={this.state.elementFactory}
            style={BAR_CHART_STYLE}
            type={RenderTypes.CANVAS}
            getTooltipContents={this.getTooltipContents}
        />
        );
    }
}

const RepeatMaskerTrack = {
    visualizer: RepeatVisualizer,
    legend: BigWigTrack.legend,
    menuItems: [BackgroundColorConfig],
    defaultOptions: DEFAULT_OPTIONS,
    getDataSource: (trackModel) => new BigWigOrBedSource(trackModel.url, new RepeatMaskerFormatter()),
};

export default RepeatMaskerTrack;
