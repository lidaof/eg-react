import React from 'react';
import PropTypes from 'prop-types';
import { getRelativeCoordinates } from '../util';

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

function Bullseye(props) {
    const {x, y} = props.where;
    const horizontalLineStyle = {
        position: "absolute",
        pointerEvents: "none",
        top: y - 1,
        left: 0,
        width: "100%",
        height: 0,
        borderTop: "1px dotted grey",
    };
    const verticalLineStyle = {
        position: "absolute",
        pointerEvents: "none",
        top: 0,
        left: x - 1,
        width: 0,
        height: "100%",
        borderLeft: "1px dotted grey"
    };
    return (
        <React.Fragment>
            <div style={horizontalLineStyle} />
            <div style={verticalLineStyle} />
        </React.Fragment>
    );
}

export default DivWithBullseye;
