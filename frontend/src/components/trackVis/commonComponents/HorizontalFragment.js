import React from 'react';
import PropTypes from 'prop-types';
import { getRelativeCoordinates } from '../../../util';
import './HorizontalFragment.css';

const LINE_MARGIN = 1; // margin between rough alignment segment and edge of polygon.
const LINE_WIDTH = 2; // line height 2px in css file.
const TRIANGLE_SIZE = 5; // triangle size 5px in css file.
/**
 * Like a <div> in every way, except it a horizontal line at where the merged alignment segment is.
 * 
 * @author Xiaoyu Zhuo
 */
class HorizontalFragment extends React.Component {
    static propTypes = {
        relativeY: PropTypes.number,
        xSpanList: PropTypes.array,
    };

    constructor(props) {
        super(props);
        this.state = {
            relativeX: null
        };

        this.storeMouseCoordinates = this.storeMouseCoordinates.bind(this);
        this.clearMouseCoordinates = this.clearMouseCoordinates.bind(this);
    }

    /**
     * Stores a mouse event's coordinates in state.
     * 
     * @param {MouseEvent} event - mousemove event whose coordinates to store
     */
    storeMouseCoordinates(event) {
        this.setState({relativeX: getRelativeCoordinates(event).x});
        if (this.props.onMouseMove) {
            this.props.onMouseMove(event);
        }
    }

    /**
     * Clears stored mouse event coordinates.
     * 
     * @param {MouseEvent} event - mouseleave event that triggered this callback
     */
    clearMouseCoordinates(event) {
        this.setState({relativeX: null});
        if (this.props.onMouseLeave) {
            this.props.onMouseLeave(event);
        }
    }

    /**
     * @inheritdoc
     */
    render() {
        const {height, targetXSpanList, queryXSpanList, primaryColor, queryColor, onMouseMove, onMouseLeave, style, children, ...otherProps} = this.props;
        // Default `position: relative`
        console.log(targetXSpanList);
        console.log(queryXSpanList);
        const relativeX = this.state.relativeX;
        console.log(relativeX);
        const xSpanIndex = targetXSpanList.reduce((iCusor, x, i) => x.start < relativeX && x.end >= relativeX  ? i : iCusor, NaN);
        const mergedStyle = Object.assign({position: 'relative'}, style);
        var lines;
        if (isNaN(xSpanIndex)) {
            lines = (<React.Fragment>{null}</React.Fragment>);
        }
        else {
            const targetXSpan = targetXSpanList[xSpanIndex];
            const queryXSpan = queryXSpanList[xSpanIndex];
            const queryX = queryXSpan.start + queryXSpan.getLength() * (relativeX - targetXSpan.start) / targetXSpan.getLength();
            console.log(queryX);
            lines = (
                <React.Fragment>
                    {<HorizontalLine relativeY={LINE_MARGIN} xSpan={targetXSpan} color={primaryColor} />}
                    {<Triangle relativeX={relativeX - TRIANGLE_SIZE} relativeY={LINE_MARGIN + LINE_WIDTH} color={primaryColor} direction={"down"}/>}
                    {<Triangle relativeX={queryX - TRIANGLE_SIZE} relativeY={height - LINE_MARGIN - LINE_WIDTH - TRIANGLE_SIZE} color={queryColor} direction={"up"}/>}
                    {<HorizontalLine relativeY={height - LINE_MARGIN - LINE_WIDTH} xSpan={queryXSpan} color={queryColor} />}
                </React.Fragment>
            )
        }
        return (
            <div
                onMouseMove={this.storeMouseCoordinates}
                onMouseLeave={this.clearMouseCoordinates}
                style={mergedStyle}
                {...otherProps} 
            >
                {children}
                {lines}
            </div>
        );
    }
}

/**
 * The actual horizontal line that covers an alignment segment.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} - element to render
 */
function HorizontalLine(props) {
    const {relativeY, xSpan, color} = props;
    const horizontalLineStyle = {
        top: relativeY,
        left: xSpan?xSpan.start:0,
        width: xSpan?xSpan.end - xSpan.start : 0,
        height: 2,
        color: color,
        willChange: "top",
    };

    return (
        <React.Fragment>
            {xSpan ? <div className="Fragment-horizontal-line" style={horizontalLineStyle} /> : null}
        </React.Fragment>
    );
}

function Triangle(props) {
    const {relativeX, relativeY, color, direction} = props;
    const triangleStyle = {
        top: relativeY,
        left: relativeX,
        color: color,
    }

    return (
        <React.Fragment>
            {/* {<div className="arrow-up" style={triangleStyle} />} */}
            {direction === "up" ?
            <div className="arrow-up" style={triangleStyle} /> :
            <div className="arrow-down" style={triangleStyle} />}
        </React.Fragment>
    );
}
export default HorizontalFragment;
