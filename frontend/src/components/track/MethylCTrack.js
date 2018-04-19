import React from 'react';

import BigWigTrack from './BigWigTrack';
import BarPlot from './commonComponents/BarPlot';
import { VISUALIZER_PROP_TYPES } from './Track';
import { BackgroundColorConfig } from './contextMenu/ColorConfig';

import MethylCRecord from '../../model/MethylCRecord';
import { MethylCBarElementFactory } from '../../art/BarElementFactory';
import { RenderTypes } from '../../art/DesignRenderer';

import './commonComponents/Tooltip.css';
import TabixSource from '../../dataSources/TabixSource';
import { BarPlotRecord } from '../../art/BarPlotDesigner';


const TOP_PADDING = 5;
const BAR_CHART_STYLE = {paddingTop: TOP_PADDING};
const DEFAULT_OPTIONS = {
    height: 40,
    contextColors: MethylCRecord.DEFAULT_CONTEXT_COLORS,
    countColor: MethylCRecord.DEFAULT_COUNT_COLOR,
};


/**
 * Visualizer for MethylC tracks. 
  * 
 * @author Daofeng Li
 */
class MethylCVisualizer extends React.PureComponent {
    static propTypes = VISUALIZER_PROP_TYPES;

    /**
     * @inheritdoc
     */
    constructor(props) {
        super(props);
        this.state = {
            elementFactory: new MethylCBarElementFactory(props.options.height, props.options),
        };
        this.getTooltipContents = this.getTooltipContents.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.options !== nextProps.options) {
            this.setState({
                elementFactory: new MethylCBarElementFactory(nextProps.options.height, nextProps.options)
            });
        }
    }

    getTooltipContents(relativeX, record) {
        if (!record) {
            return null;
        }
        //console.log(record);
        return (
        <ul style={{margin: 0, padding: '0px 5px 5px', listStyleType: 'none'}} >
            <li>
                <span className="Tooltip-major-text" style={{marginRight: 5}} >{record.getContext()}</span>
            </li>
            <li>{record.getLocus().toString()}</li>
            <li>{"Methylation level: " + record.getValue()}</li>
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
                data={data || []}
                width={width}
                height={options.height}
                elementFactory={this.state.elementFactory}
                style={BAR_CHART_STYLE}
                type={RenderTypes.CANVAS}
                getTooltipContents={this.getTooltipContents}
            />
        </React.Fragment>
        );
    }
}

const MethylCTrack = {
    visualizer: MethylCVisualizer,
    legend: (props) => <BigWigTrack.legend {...props} data={props.data || []} />,
    menuItems: [BackgroundColorConfig],
    defaultOptions: DEFAULT_OPTIONS,
    getDataSource: trackModel => new TabixSource(trackModel.url),
    processData: null
};

export default MethylCTrack;
