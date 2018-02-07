import React from 'react';
import _ from 'lodash';
import { scaleLinear } from 'd3-scale'

import { TRACK_PROP_TYPES } from './Track'
import TrackLegend from './TrackLegend';
import BarChart from '../BarChart';

import BigWigSource from '../../dataSources/BigWigSource';

const DEFAULT_HEIGHT = 30; // In pixels
const TOP_MARGIN = 5;

function BigWigLegend(props) {
    const height = props.trackModel.options.height || DEFAULT_HEIGHT;
    let scale = null;
    if (props.data.length > 0) {
        const dataMax = _.maxBy(props.data, record => record.value).value;
        scale = scaleLinear().domain([dataMax, 0]).range([0, height]);
    }
    return <div style={{marginTop: TOP_MARGIN}}>
        <TrackLegend trackModel={props.trackModel} scaleForAxis={scale} height={height} />
    </div>;
}

class BigWigVisualizer extends React.PureComponent {
    render() {
        const {data, viewRegion, trackModel, width, error} = this.props;
        const height = trackModel.options.height || DEFAULT_HEIGHT;
        let style = {marginTop: TOP_MARGIN, display: "block"}; // display: block to prevent extra bottom padding
        if (error) {
            style.backgroundColor = "red";
        }
    
        return (
        <BarChart
            viewRegion={viewRegion}
            data={data}
            width={width}
            height={height}
            style={style}
            svg={false}
        />
        );
    }
}

const BigWigTrack = {
    getDataSource: (trackModel) => new BigWigSource(trackModel.url),
    legend: BigWigLegend,
    visualizer: BigWigVisualizer
};

export default BigWigTrack;
