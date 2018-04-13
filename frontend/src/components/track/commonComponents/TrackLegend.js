import React from 'react';
import PropTypes from 'prop-types';
import { select } from 'd3-selection';
import { axisLeft } from 'd3-axis';

import TrackModel from '../../../model/TrackModel';

const NUM_TICKS_SUGGESTION = 2;
const AXIS_WIDTH = 30;

/**
 * A box displaying labels, axes, and other important track info.
 * 
 * @author Silas Hsu
 */
class TrackLegend extends React.PureComponent {
    static propTypes = {
        trackModel: PropTypes.instanceOf(TrackModel).isRequired, // Track metadata
        height: PropTypes.number.isRequired, // Height of the legend
        scaleForAxis: PropTypes.func, // A d3 scale function, used for drawing axes
        style: PropTypes.object, // CSS
    };

    static WIDTH = 120;

    constructor(props) {
        super(props);
        this.gNode = null;
    }

    componentDidMount() {
        this.drawAxis();
    }

    componentDidUpdate(nextProps) {
        if (this.props.scaleForAxis !== nextProps.scaleForAxis) {
            this.drawAxis();
        }
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
        const {trackModel, height, scaleForAxis, style} = this.props;
        if (height === 0) {
            console.warn("Warning: rendering a 0-height track legend");
        }

        const divStyle = Object.assign({
            display: "flex",
            width: TrackLegend.WIDTH,
            height: height,
            backgroundColor: trackModel.isSelected ? "yellow" : undefined,
        }, style);
        const pStyle = {
            margin: 0,
            width: this.scaleForAxis ? TrackLegend.WIDTH - AXIS_WIDTH : TrackLegend.WIDTH,
            maxHeight: height,
            fontSize: "x-small",
            lineHeight: 1,
            wordWrap: "break-word",
            overflow: "hidden",
        };

        let axis = null;
        if (scaleForAxis) {
            axis = <svg width={AXIS_WIDTH} height={height} style={{overflow: "visible"}} >
                <g ref={node => this.gNode = node} transform={`translate(${AXIS_WIDTH}, 0)`} />
            </svg>;
        }

        const label = trackModel.getDisplayLabel();
        return (
        <div style={divStyle} >
            <p style={pStyle} title={label}>{label}</p>
            {axis}
        </div>
        );
    }
}

export default TrackLegend;
