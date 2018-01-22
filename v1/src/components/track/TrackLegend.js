import React from 'react';
import PropTypes from 'prop-types';
import { select } from 'd3-selection';
import { axisLeft } from 'd3-axis';

import TrackModel from '../../model/TrackModel';

const NUM_TICKS_SUGGESTION = 2;
const LABEL_RIGHT_MARGIN = 30;
const LABEL_HEIGHT = 12;

/**
 * A box displaying labels, axes, and other important track info.
 * 
 * @author Silas Hsu
 */
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
            display: "inline-block",
            width: TrackLegend.WIDTH,
            height: this.props.height,
            fontSize: 10,
        };

        return (
        <div style={divStyle} onMouseDown={(event) => event.stopPropagation()}>
            <svg width={TrackLegend.WIDTH} height={this.props.height}>
                <foreignObject
                    width={TrackLegend.WIDTH - LABEL_RIGHT_MARGIN} height={LABEL_HEIGHT}
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
