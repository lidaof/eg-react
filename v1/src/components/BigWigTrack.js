import LinearDrawingModel from '../model/LinearDrawingModel';
import BigWigDataSource from '../dataSources/BigWigDataSource';
import React from 'react';
import Track from './Track';
import TrackLegend from './TrackLegend';
import TrackLoadingNotice from './TrackLoadingNotice';
import _ from 'lodash';
import { scaleLinear } from 'd3-scale'

const EXTRA_RENDER_WIDTH = 1; // Multiple of current region length, on each side
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

    makeDefaultDataSource() {
        return new BigWigDataSource(this.props.trackModel.url, 2 * EXTRA_RENDER_WIDTH + 1);
    }

    componentDidMount() {
        this.draw();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.data !== this.state.data) {
            this.draw();
        }
    }

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
        
        const drawModel = new LinearDrawingModel(this.props.viewRegion, this.props.width, canvas);
        const translate = this.props.width * EXTRA_RENDER_WIDTH;
        non0Data.forEach(record => {
            const x = Math.round(drawModel.baseToX(record.start)) + translate;
            const y = Math.round(canvasHeight - (record.value/dataMax * canvasHeight) + TOP_PADDING);
            const width = 1;
            const height = Math.round(record.value/dataMax * canvasHeight);
            context.fillRect(x, y, width, height);
        });
    }

    render() {
        let height = this.props.trackModel.options.height || DEFAULT_HEIGHT;
        console.log(height);
        const divStyle = {
            overflow: "hidden",
            textAlign: "center",
        };
        let canvasStyle = {
            borderTop: "1px solid black",
            borderBottom: "1px solid black",
            display: "block",

            position: "relative",
            marginLeft: `-${this.props.width * EXTRA_RENDER_WIDTH}px`,
            left: this.props.xOffset,
        };
        if (this.state.error) {
            canvasStyle.backgroundColor = "red";
        }

        let scale = null;
        if (this.state.data && this.state.data.length > 0) {
            const dataMax = _.maxBy(this.state.data, record => record.value).value;
            scale = scaleLinear().domain([dataMax, 0]).range([TOP_PADDING, height]);
        }

        return (
            <div style={divStyle}>
                <TrackLegend height={height + 2} trackModel={this.props.trackModel} scaleForAxis={scale} />
                {this.state.isLoading ? <TrackLoadingNotice height={height} /> : null}
                <canvas
                    width={(this.props.width - TrackLegend.WIDTH) * (2 * EXTRA_RENDER_WIDTH + 1)}
                    height={height}
                    style={canvasStyle}
                    ref={node => this.canvasNode = node}
                />
            </div>
        );
    }
}

export default BigWigTrack;
