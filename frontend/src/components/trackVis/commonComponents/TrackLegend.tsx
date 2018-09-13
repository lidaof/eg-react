import React from 'react';
import { connect } from 'react-redux';
import { ScaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { axisLeft } from 'd3-axis';

import { AppState } from '../../../AppState';
import { TranslatableG } from '../../TranslatableG';
import TrackModel from '../../../model/TrackModel';

import './TrackLegend.css';
import { StateWithHistory } from 'redux-undo';

interface TrackLegendProps {
    trackModel: TrackModel; // Track metadata
    width: number; // Legend width
    height: number; // Legend height
    axisScale?: ScaleLinear<number, number>; // A d3 scale function, used for drawing axes
    axisScaleReverse?: ScaleLinear<number, number>; // A d3 scale function, used for drawing axes
    style?: object;
}

const NUM_TICKS_SUGGESTION = 2;
const AXIS_WIDTH = 30;

const mapStateToProps = (state: {browser: StateWithHistory<AppState>}) => {
    return {
        width: state.browser.present.trackLegendWidth
    };
}

/**
 * A box displaying labels, axes, and other important track info.
 * 
 * @author Silas Hsu
 */
class TrackLegend extends React.PureComponent<TrackLegendProps> {
    static defaultProps = {
        width: 100
    };

    private gNode: SVGGElement;

    constructor(props: TrackLegendProps) {
        super(props);
        this.gNode = null;
        this.handleRef = this.handleRef.bind(this);
    }

    componentDidMount() {
        this.drawAxis();
    }

    componentDidUpdate(nextProps: TrackLegendProps) {
        if (this.props.axisScale !== nextProps.axisScale) {
            this.drawAxis();
        }
    }

    handleRef(node: SVGGElement) {
        this.gNode = node;
    }

    drawAxis() {
        if (this.gNode && this.props.axisScale) {
            while(this.gNode.hasChildNodes()) { // Believe it not, there's no function that removes all child nodes.
                (this.gNode.lastChild as Element).remove();
            }

            const axis = axisLeft(this.props.axisScale);
            axis.ticks(NUM_TICKS_SUGGESTION);
            select(this.gNode).append("g").call(axis);
            if (this.props.axisScaleReverse) {
                const axis2 = axisLeft(this.props.axisScaleReverse);
                axis2.ticks(NUM_TICKS_SUGGESTION);
                select(this.gNode).append("g")
                    .attr("transform", "translate(" + 0 + "," + this.props.height * 0.5 + ")")
                    .call(axis2).selectAll(".tick")
                    .filter( (d) =>  d === 0 )
                    .remove();
            }
        }
    }

    getLabelWidth() {
        if (this.props.axisScale) {
            return this.props.width - AXIS_WIDTH;
        } else {
            return undefined;
        }
    }

    render() {
        const {trackModel, width, height, axisScale, style, axisScaleReverse} = this.props;
        if (height <= 0) {
            return null;
        }
        const axisHeight = axisScaleReverse ? height * 0.5 : height;
        const divStyle = Object.assign({
            display: "flex",
            width,
            height,
            backgroundColor: trackModel.isSelected ? "yellow" : undefined,
        }, style);
        const pStyle = {
            width: this.getLabelWidth(),
            maxHeight: height,
        };

        let axis = null;
        if (axisScale) {
            axis = <svg width={AXIS_WIDTH} height={axisHeight} style={{overflow: "visible"}} >
                <TranslatableG innerRef={this.handleRef} x={AXIS_WIDTH} />
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

export default connect(mapStateToProps)(TrackLegend);
