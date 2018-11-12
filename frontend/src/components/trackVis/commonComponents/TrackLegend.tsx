import React from 'react';
import { connect } from 'react-redux';
import { ScaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { axisLeft } from 'd3-axis';
import { AppState } from '../../../AppState';
import { TranslatableG } from '../../TranslatableG';
import TrackModel from '../../../model/TrackModel';
import { StateWithHistory } from 'redux-undo';
import { BASE_COLORS, Sequence } from '../../Sequence';
import LinearDrawingModel from '../../../model/LinearDrawingModel';
import DisplayedRegionModel from '../../../model/DisplayedRegionModel';

import './TrackLegend.css';

interface TrackLegendProps {
    trackModel: TrackModel; // Track metadata
    width: number; // Legend width
    height: number; // Legend height
    axisScale?: ScaleLinear<number, number>; // A d3 scale function, used for drawing axes
    axisScaleReverse?: ScaleLinear<number, number>; // A d3 scale function, used for drawing axes
    style?: object;
    trackWidth?: number;
    trackViewRegion?: DisplayedRegionModel;
    noRenderFirstAxisLabel?: boolean;
    noShiftFirstAxisLabel?: boolean;
}

// const NUM_TICKS_SUGGESTION = 2;
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
        this.plotATCGLegend = this.plotATCGLegend.bind(this);
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
            // axis.ticks(NUM_TICKS_SUGGESTION);
            const axisDomain = this.props.axisScale.domain();
            if (!axisDomain.includes(NaN)) {
                axis.tickValues(axisDomain);
            }
            console.log(this.props.axisScaleReverse, this.props.noShiftFirstAxisLabel, 
                this.props.axisScaleReverse || this.props.noShiftFirstAxisLabel);
            const dy0 = this.props.axisScaleReverse || this.props.noShiftFirstAxisLabel ? "0.32em" : "-0.1em"; 
            if(axisDomain[0] !== axisDomain[1]) {
                select(this.gNode).append("g").call(axis);
            }   
            select(this.gNode).selectAll("text")
                .filter((d, i) => i === 0 && d !== 0 ).attr("dy", "0.6em");
            select(this.gNode).selectAll("text")
                .filter((d, i) => i === 1).attr("dy", dy0);
            if (this.props.noRenderFirstAxisLabel) {
                select(this.gNode).selectAll(".tick")
                        .filter( (d, i) =>  i === 0 )
                        .remove();
            }
            if (this.props.axisScaleReverse) {
                const axis2 = axisLeft(this.props.axisScaleReverse);
                // axis2.ticks(NUM_TICKS_SUGGESTION);
                const axis2Domain = this.props.axisScaleReverse.domain();
                if(!axis2Domain.includes(NaN)) {
                    axis2.tickValues(axis2Domain);
                }
                if(axis2Domain[0] !== axis2Domain[1]) {
                    select(this.gNode).append("g")
                        .attr("transform", "translate(" + 0 + "," + this.props.height * 0.5 + ")")
                        .call(axis2).selectAll(".tick")
                        .filter( d =>  d === 0 )
                        .remove();
                }
                select(this.gNode).selectAll("text")
                    .filter((d, i) => i === 2 ).attr("dy", "-0.1em");  
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

    plotATCGLegend() {
        const divs = Object.entries(BASE_COLORS).map(base => {
            return <div key={base[0]} 
                style={{backgroundColor: base[1],color:"white"}}>{base[0]}</div>;
        });
        return divs;
    }

    render() {
        const {trackModel, width, height, axisScale, style, axisScaleReverse,
            trackViewRegion, trackWidth} = this.props;
        if (height <= 0) {
            return null;
        }
        const axisHeight = axisScaleReverse ? height * 0.5 : height;
        const divStyle = Object.assign({
            display: "flex",
            width,
            minWidth: width,
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
                <TranslatableG innerRef={this.handleRef} x={AXIS_WIDTH-1} />
            </svg>;
        }

        const label = trackModel.getDisplayLabel();
        let plotLegend = false;
        if(trackModel.type === 'ruler') {
            const drawModel = new LinearDrawingModel(trackViewRegion, trackWidth);
            if (drawModel.basesToXWidth(1) > Sequence.MIN_X_WIDTH_PER_BASE) {
                plotLegend = true;
            } else {
                plotLegend = false;
            }
        }
        return (
        <div style={divStyle} title={label}>
            <p className="TrackLegend-label" style={pStyle} >{label}</p>
            <div style={{display: "flex", alignItems: "center", fontSize: "12px"}}>
                {plotLegend && this.plotATCGLegend()}</div>
            {axis}
        </div>
        );
    }
}

export default connect(mapStateToProps)(TrackLegend);
