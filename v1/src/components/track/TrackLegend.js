import React from 'react';
import PropTypes from 'prop-types';
import { select } from 'd3-selection';
import { axisLeft } from 'd3-axis';

import TrackModel from '../../model/TrackModel';

const NUM_TICKS_SUGGESTION = 2;
const AXIS_WIDTH = 30;

/**
 * A box displaying labels, axes, and other important track info.
 * 
 * @author Silas Hsu
 */
class TrackLegend extends React.PureComponent {
    static WIDTH = 120;

    static propTypes = {
        trackModel: PropTypes.instanceOf(TrackModel).isRequired,
        scaleForAxis: PropTypes.func,
        height: PropTypes.number, // Required when scaleForAxis is defined.
    };

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
            while(this.gNode.hasChildNodes()) { // Believe it not, there's no function that removes all child nodes.
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
            display: "flex",
            width: TrackLegend.WIDTH,
        };
        const pStyle = {
            margin: 0,
            maxWidth: this.scaleForAxis ? TrackLegend.WIDTH - AXIS_WIDTH : TrackLegend.WIDTH,
            wordWrap: "break-word",
            fontSize: 10
        };

        let axis = null;
        if (this.props.scaleForAxis) {
            if (!this.props.height) {
                console.error("The `height` prop is required when drawing an axis.");
            }
            axis = <svg width={AXIS_WIDTH} height={this.props.height} style={{overflow: "visible"}} >
                <g ref={node => this.gNode = node} transform={`translate(${AXIS_WIDTH}, 0)`} />
            </svg>;
        }

        return (
        <div style={divStyle} >
            <p style={pStyle} >{this.props.trackModel.name}</p>
            {axis}
        </div>
        );
    }
}

export default TrackLegend;
