import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Manager, Target, Popper, Arrow } from 'react-popper';

const BACKGROUND_COLOR = "rgba(173, 216, 230, 0.9)"; // lightblue with opacity adjustment
const ARROW_HEIGHT = 15;

const CONTENT_STYLE = {
    zIndex: 1,
    backgroundColor: BACKGROUND_COLOR,
    borderRadius: 5,
    marginTop: ARROW_HEIGHT,
};

const ARROW_STYLE = { // This is for a upwards-pointing arrow; other directions will require more code.
    width: 0,
    height: 0,
    position: "absolute",
    top: -ARROW_HEIGHT,
    borderLeft: `${ARROW_HEIGHT/2}px solid transparent`,
    borderRight: `${ARROW_HEIGHT/2}px solid transparent`,
    borderBottom: `${ARROW_HEIGHT}px solid ${BACKGROUND_COLOR}`,
};

/**
 * A tooltip.  Its position is absolute and specified by props.  Content is managed via children.  Does not close
 * itself; however, there is a `onClose` prop that requests closings.
 * 
 * @author Silas Hsu
 */
class Tooltip extends React.PureComponent {
    static propTypes = {
        x: PropTypes.number, // x coordinate relative to the top left corner of the HTML body.
        y: PropTypes.number, // y coordinate relative to the top left corner of the HTML body.
        onClose: PropTypes.func, // Called when the tooltip wants to close.  Signature: (event: MouseEvent): void
    };

    static defaultProps = {
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

    /**
     * @inheritdoc
     */
    render() {
        const {x, y, children} = this.props;
        return ReactDOM.createPortal(
            <Manager>
                <Target style={{position: "absolute", left: x, top: y}} />
                <Popper
                    placement="bottom"
                    style={CONTENT_STYLE}
                    innerRef={node => this.popperRef = node}
                    onMouseDown={event => event.stopPropagation()} // Stop drag-across events when clicking inside
                >
                    {children}
                    <Arrow style={ARROW_STYLE} />
                </Popper>
            </Manager>,
            document.body
        );
    }
}

export default Tooltip;
