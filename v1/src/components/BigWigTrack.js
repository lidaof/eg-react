import React from 'react';
import _ from 'lodash';
import { scaleLinear } from 'd3-scale'

import Track from './Track';
import TrackLegend from './TrackLegend';
import TrackLoadingNotice from './TrackLoadingNotice';
import ScrollingData from './ScrollingData';

import BigWigDataSource from '../dataSources/BigWigDataSource';
import RegionExpander from '../model/RegionExpander';
import LinearDrawingModel from '../model/LinearDrawingModel';

const DEFAULT_HEIGHT = 30; // In pixels
const TOP_PADDING = 5;

/**
 * Track that displays BigWig data.
 * 
 * @author Silas Hsu
 */
class BigWigTrack extends Track {
    static TYPE_NAME = "bigwig";

    constructor(props) {
        super(props);
        this.canvasNode = null;
    }

    /**
     * @inheritdoc
     */
    makeDefaultDataSource() {
        return new BigWigDataSource(this.props.trackModel.url);
    }

    /**
     * Draws the data.
     */
    componentDidMount() {
        this.draw();
    }

    /**
     * Redraws the data if it has changed.
     */
    componentDidUpdate(prevProps, prevState) {
        if (prevState.data !== this.state.data) {
            this.draw();
        }
    }

    /**
     * Draws the data.
     */
    draw() {
        if (!this.canvasNode) {
            return;
        }
        const canvas = this.canvasNode;
        const canvasHeight = canvas.height;
        const context = canvas.getContext("2d");
        context.fillStyle = "blue";
        context.clearRect(0, 0, canvas.width, canvasHeight);

        const data = this.state.data || [];
        const non0Data = data.filter(record => record.value !== 0);
        if (non0Data.length === 0) {
            return;
        }
        const dataMax = _.maxBy(data, record => record.value).value;
        
        let viewExpansion = new RegionExpander(this.props.viewExpansionValue)
            .calculateExpansion(this.props.width, this.props.viewRegion);
        const drawModel = new LinearDrawingModel(viewExpansion.expandedRegion, viewExpansion.expandedWidth, canvas);
        non0Data.forEach(record => {
            const x = Math.round(drawModel.baseToX(record.start));
            const y = Math.round(canvasHeight - (record.value/dataMax * canvasHeight) + TOP_PADDING);
            const width = 1;
            const height = Math.round(record.value/dataMax * canvasHeight);
            context.fillRect(x, y, width, height);
        });
    }

    render() {
        let height = this.props.trackModel.options.height || DEFAULT_HEIGHT;
        let canvasStyle = this.state.error ? {backgroundColor : "red"} : {};

        let scale = null;
        if (this.state.data && this.state.data.length > 0) {
            const dataMax = _.maxBy(this.state.data, record => record.value).value;
            scale = scaleLinear().domain([dataMax, 0]).range([TOP_PADDING, height]);
        }

        let viewExpansion = new RegionExpander(this.props.viewExpansionValue)
            .calculateExpansion(this.props.width, this.props.viewRegion);
        return (
        <div style={{display: "flex", borderBottom: "1px solid grey"}}>
            <TrackLegend height={height} trackModel={this.props.trackModel} scaleForAxis={scale} />
            {this.state.isLoading ? <TrackLoadingNotice height={this.props.height} /> : null}
            <ScrollingData
                width={this.props.width}
                height={height}
                viewExpansion={viewExpansion}
                xOffset={this.props.xOffset}
            >
                <canvas ref={node => this.canvasNode = node} style={canvasStyle} />
            </ScrollingData>
        </div>
        );
    }
}

export default BigWigTrack;
