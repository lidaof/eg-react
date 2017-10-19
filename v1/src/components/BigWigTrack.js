import LinearDrawingModel from '../model/LinearDrawingModel';
import BigWigDataSource from '../dataSources/BigWigDataSource';
import React from 'react';
import Track from './Track';
import _ from 'lodash';

const EXTRA_RENDER_WIDTH = 1; // Multiple of current region length, on each side
const DEFAULT_HEIGHT = 30; // In pixels

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
            const y = Math.round(canvasHeight - (record.value/dataMax * canvasHeight) + 10);
            const width = 1;
            const height = Math.round(record.value/dataMax * canvasHeight);
            context.fillRect(x, y, width, height);
        });
    }

    render() {
        const height = this.props.trackModel.options.height || DEFAULT_HEIGHT;
        const divStyle = {
            overflow: "hidden",
            textAlign: "center",
        };
        const loadingDivStyle = {
            position: "absolute",
            width: "100%",
            height: `${height}px`,
            backgroundColor: "white",
            textAlign: "center",
            opacity: 0.6,
            zIndex: 1,
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

        return (
            <div style={divStyle}>
                {this.state.isLoading ? <div style={loadingDivStyle}><h3>Loading...</h3></div> : null}
                <canvas
                    width={this.props.width * (2 * EXTRA_RENDER_WIDTH + 1)}
                    height={height}
                    style={canvasStyle}
                    ref={node => this.canvasNode = node}
                />
            </div>
        );
    }
}

export default BigWigTrack;
