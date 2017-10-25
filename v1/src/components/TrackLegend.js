import React from 'react';
import PropTypes from 'prop-types';
import TrackModel from '../model/TrackModel';
import { select } from 'd3-selection';
import { axisLeft } from 'd3-axis';

const NUM_TICKS_SUGGESTION = 2;

class TrackLegend extends React.PureComponent {
    static WIDTH = 120;

    static propTypes = {
        height: PropTypes.number.isRequired,
        trackModel: PropTypes.instanceOf(TrackModel).isRequired,
        scaleForAxis: PropTypes.func,
    }

    constructor(props) {
        super(props);
        this.gNode = null;
    }

    componentDidMount() {
        this.drawAxis();
    }

    componentDidUpdate() {
        this.drawAxis();
    }

    drawAxis() {
        if (this.gNode && this.props.scaleForAxis) {
            while(this.gNode.hasChildNodes()) {
                this.gNode.lastChild.remove();
            }

            const axis = axisLeft(this.props.scaleForAxis);
            axis.ticks(NUM_TICKS_SUGGESTION);
            select(this.gNode).call(axis);
            this.gNode.lastChild.remove(); // Remove the '0' label
        }
    }

    render() {
        const divStyle = {
            opacity: 0.95,
            zIndex: 2,
            backgroundColor: "white",
            borderRight: "1px solid black",
            width: TrackLegend.WIDTH,
            height: this.props.height,
            position: "absolute",
            fontSize: 10,
        };

        return (
        <div style={divStyle} >
            <svg width={TrackLegend.WIDTH} height={this.props.height} ref={node => this.svgNode = node}>
                <foreignObject
                    width={TrackLegend.WIDTH - 20}
                    style={{fontSize: 9, textAlign: "left"}}
                >
                    {this.props.trackModel.name}
                </foreignObject>
                <g ref={node => this.gNode = node} transform={`translate(${TrackLegend.WIDTH}, 0)`} />
            </svg>
        </div>
        );
    }
}

export default TrackLegend;
