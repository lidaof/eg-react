import React from 'react';
import PropTypes from 'prop-types';
import { getRelativeCoordinates } from '../../../util';
import OpenInterval from 'src/model/interval/OpenInterval';
import './HorizontalFragment.css';
import { relative } from 'path';

/**
 * Like a <div> in every way, except it a horizontal line at where the merged alignment segment is.
 * 
 * @author Xiaoyu Zhuo
 */
class HorizontalFragment extends React.Component {
    static propTypes = {
        innerRef: PropTypes.func, // Ref to the div
        relativeY: PropTypes.number,
        XSpanList: PropTypes.array,
    };

    constructor(props) {
        super(props);
        this.state = {
            realativeX: null
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
        const {relativeY, xSpanList, innerRef, onMouseMove, onMouseLeave, style} = this.props;
        // Default `position: relative` so the bullseye looks right
        console.log(this.state);

        const relativeX = 500;
        console.log(xSpanList);
        const xSpanIndex = xSpanList.reduce((iCusor, x, i) => x.start < relativeX && x.end >= relativeX  ? i : iCusor, 0);
        const mergedStyle = Object.assign({position: 'relative'}, style);
        return (
        <div
            onMouseMove={this.storeMouseCoordinates}
            onMouseLeave={this.clearMouseCoordinates}
            style={mergedStyle}
        >
            {this.state.relativeX ? <HorizontalLine xSpan={xSpanList[xSpanIndex]} />: null}
        </div>
        );
    }
}

/**
 * The actual intersecting lines that form the bullseye.  Uses prop `where`, an object with props `x` and `y`.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} - element to render
 */
function HorizontalLine(relativeY, xSpan) {
    const horizontalLineStyle = {
        height: relativeY,
        left: xSpan.start,
        right: xSpan.end,
        willChange: "top",
    };

    return (
        <React.Fragment>
            <div className="Fragment-horizontal-line" style={horizontalLineStyle} />
        </React.Fragment>
    );
}

export default HorizontalFragment;
