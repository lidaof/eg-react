import React from 'react';
import PropTypes from 'prop-types';
import { select } from 'd3-selection';
import { axisLeft } from 'd3-axis';

import { TranslatableG } from '../../TranslatableG';
import TrackModel from '../../../model/TrackModel';

import './TrackLegend.css';

const NUM_TICKS_SUGGESTION = 3;
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
        axisScale: PropTypes.func, // A d3 scale function, used for drawing axes
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
        if (this.props.axisScale !== nextProps.axisScale) {
            this.drawAxis();
        }
    }

    drawAxis() {
        if (this.gNode && this.props.axisScale) {
            while(this.gNode.hasChildNodes()) { // Believe it not, there's no function that removes all child nodes.
                this.gNode.lastChild.remove();
            }

            const axis = axisLeft(this.props.axisScale);
            axis.ticks(NUM_TICKS_SUGGESTION);
            select(this.gNode).call(axis);
            this.gNode.lastChild.remove(); // Remove the '0' label
        }
    }

    getLabelWidth() {
        let width = TrackLegend.WIDTH;
        if (this.props.axisScale) {
            width -= AXIS_WIDTH;
        }
        return width;
    }

    render() {
        const {trackModel, height, axisScale, style} = this.props;
        if (height <= 0) {
            return null;
        }

        const divStyle = Object.assign({
            display: "flex",
            width: TrackLegend.WIDTH,
            height: height,
            backgroundColor: trackModel.isSelected ? "yellow" : undefined,
        }, style);
        const pStyle = {
            width: this.getLabelWidth(),
            maxHeight: height,
        };

        let axis = null;
        if (axisScale) {
            axis = <svg width={AXIS_WIDTH} height={height} style={{overflow: "visible"}} >
                <TranslatableG innerRef={node => this.gNode = node} x={AXIS_WIDTH} />
            </svg>;
        }

        const label = trackModel.getDisplayLabel();
        return (
        <div style={divStyle} title={label}>
            <p className="TrackLegend-label" style={pStyle} >{label}</p>
            {axis}
        </div>
        );
    }
}

export default TrackLegend;
