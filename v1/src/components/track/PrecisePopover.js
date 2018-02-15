import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Manager, Target, Popper, Arrow } from 'react-popper';
import { getPageCoordinates } from '../../util';

class PrecisePopover extends React.PureComponent {
    static propTypes = {
        relativeTo: PropTypes.instanceOf(Element), // Element which determines the meaning of `x` and `y`
        x: PropTypes.number, // x coordinate relative to the top left corner of `relativeTo`.
        y: PropTypes.number, // y coordinate relative to the top left corner of `relativeTo`.
        arrowStyle: PropTypes.object,
        contentStyle: PropTypes.object,
        onClose: PropTypes.func, // Called when the popover wants to close.  Signature: (event: MouseEvent): void
    };

    static defaultProps = {
        relativeTo: document.body,
        x: 0,
        y: 0,
        onClose: () => undefined
    };

    constructor(props) {
        super(props);
        this.popperRef = null;
        this.detectOutsideClick = this.detectOutsideClick.bind(this);
    }

    /**
     * Registers an event listener so we know when to close this tooltip.
     */
    componentDidMount() {
        document.addEventListener('mousedown', this.detectOutsideClick);
    }

    /**
     * Detects if a mouse event happened outside the tooltip, and if so, requests the tooltip be closed.
     * 
     * @param {MouseEvent} event - event to inspect
     */
    detectOutsideClick(event) {
        if (!this.popperRef.contains(event.target)) {
            this.props.onClose(event);
        }
    }

    /**
     * Deregisters the event listener attached with componentDidMount()
     */
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.detectOutsideClick);
    }

    render() {
        const {relativeTo, x, y, arrowStyle, contentStyle, children} = this.props;
        const pageCoords = getPageCoordinates(relativeTo, x, y);
        const tooltip = (
            <Manager>
                <Target style={{position: "absolute", left: pageCoords.x, top: pageCoords.y}} />
                <Popper
                    placement="bottom-start"
                    style={contentStyle}
                    innerRef={node => this.popperRef = node}
                    onMouseDown={event => event.stopPropagation()} // See explanation below
                >
                    {children}
                    <Arrow style={arrowStyle} />
                </Popper>
            </Manager>
        );

        /**
         * On the stopPropagation() for onMouseDown: despite being in document.body, parents of the Tooltip in React's
         * virtual DOM will still get mouse events.  Stopping propagation stops several undesirable behaviors related to
         * dragging.
         */
        return ReactDOM.createPortal(tooltip, document.body);
    }
}

export default PrecisePopover;
