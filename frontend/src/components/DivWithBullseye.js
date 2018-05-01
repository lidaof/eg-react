import React from 'react';
import PropTypes from 'prop-types';
import { getRelativeCoordinates } from '../util';

import './DivWithBullseye.css';

/**
 * Like a <div> in every way, except it has "bullseye", dotted lines that track where the mouse is.
 * 
 * @author Silas Hsu
 */
class DivWithBullseye extends React.Component {
    static propTypes = {
        innerRef: PropTypes.func, // Ref to the div
    };

    constructor(props) {
        super(props);
        this.state = {
            mouseCoordinates: null
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
        this.setState({mouseCoordinates: getRelativeCoordinates(event)});
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
        this.setState({mouseCoordinates: null});
        if (this.props.onMouseLeave) {
            this.props.onMouseLeave(event);
        }
    }

    /**
     * @inheritdoc
     */
    render() {
        const {innerRef, onMouseMove, onMouseLeave, style, children, ...otherProps} = this.props;
        // Default `position: relative` so the bullseye looks right
        const mergedStyle = Object.assign({position: 'relative'}, style);
        return (
        <div
            ref={innerRef}
            onMouseMove={this.storeMouseCoordinates}
            onMouseLeave={this.clearMouseCoordinates}
            style={mergedStyle}
            {...otherProps}
        >
            {children}
            {this.state.mouseCoordinates ? <Bullseye where={this.state.mouseCoordinates} />: null}
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
function Bullseye(props) {
    const {x, y} = props.where;
    const horizontalLineStyle = {
        top: y - 1,
        willChange: "top",
    };
    const verticalLineStyle = {
        left: x - 1,
        willChange: "left",
    };
    return (
        <React.Fragment>
            <div className="Bullseye-horizontal-line" style={horizontalLineStyle} />
            <div className="Bullseye-vertical-line" style={verticalLineStyle} />
        </React.Fragment>
    );
}

export default DivWithBullseye;
