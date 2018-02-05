import React from 'react';
import _ from 'lodash';
import { scaleLinear } from 'd3-scale'

import { TRACK_PROP_TYPES } from './Track'
import TrackLegend from './TrackLegend';
import TrackLoadingNotice from './TrackLoadingNotice';
import BarChart from '../BarChart';
import withExpandedWidth from '../withExpandedWidth';

import RegionExpander from '../../model/RegionExpander';

const DEFAULT_HEIGHT = 30; // In pixels
const TOP_PADDING = 5;

const WideBarChart = withExpandedWidth(BarChart);

/**
 * Track that displays BigWig data.
 * 
 * @author Silas Hsu
 */
class BigWigTrack extends React.Component {
    static propTypes = TRACK_PROP_TYPES;

    render() {
        let height = this.props.trackModel.options.height || DEFAULT_HEIGHT;
        let canvasStyle = {marginTop: TOP_PADDING};
        if (this.props.error) {
            canvasStyle.backgroundColor = "red";
        }

        let scale = null;
        if (this.props.data.length > 0) {
            const dataMax = _.maxBy(this.props.data, record => record.value).value;
            scale = scaleLinear().domain([dataMax, 0]).range([TOP_PADDING, height]);
        }

        let viewExpansion = new RegionExpander(this.props.viewExpansionValue)
            .calculateExpansion(this.props.width, this.props.viewRegion);
        return (
        <div style={{display: "flex", borderBottom: "1px solid grey"}}>
            <TrackLegend height={height} trackModel={this.props.trackModel} scaleForAxis={scale} />
            {this.props.isLoading ? <TrackLoadingNotice height={this.props.height} /> : null}
            <WideBarChart
                viewRegion={viewExpansion.expandedRegion}
                data={this.props.data}
                height={height}
                style={canvasStyle}
                // These three are props requested by withExpandedWidth
                visibleWidth={this.props.width}
                viewExpansion={viewExpansion}
                xOffset={this.props.xOffset}
                svg={false}
            />
        </div>
        );
    }
}

export default BigWigTrack;
