import React from 'react';
import PropTypes from 'prop-types';
import PrecisePopover from './PrecisePopover';

const BACKGROUND_COLOR = "rgba(173, 216, 230, 0.9)"; // lightblue with opacity adjustment
const ARROW_SIZE = 15;
const ARROW_STYLE = { // This is for a upwards-pointing arrow; other directions will require more code.
    width: 0,
    height: 0,
    position: "absolute",
    top: -ARROW_SIZE,
    borderLeft: `${ARROW_SIZE/2}px solid transparent`,
    borderRight: `${ARROW_SIZE/2}px solid transparent`,
    borderBottom: `${ARROW_SIZE}px solid ${BACKGROUND_COLOR}`,
}

/**
 * A tooltip with a upwards-pointing arrow, and content below.  Its position refers to the tip of the arrow.  Content is
 * managed via children.  Does not close itself; however, there is a `onClose` prop that requests closings.
 * 
 * @author Silas Hsu
 */
class Tooltip extends React.PureComponent {
    static propTypes = {
        relativeTo: PropTypes.instanceOf(Element), // Element which determines the meaning of `x` and `y`
        x: PropTypes.number, // x of the tip of the arrow, relative to the top left corner of `relativeTo`.
        y: PropTypes.number, // x of the tip of the arrow, relative to the top left corner of `relativeTo`.
        ignoreMouse: PropTypes.bool, // Whether the content should be invisible to mouse events
        onClose: PropTypes.func, // Called when the tooltip wants to close.  Signature: (event: MouseEvent): void
    };

    /**
     * @inheritdoc
     */
    render() {
        const {relativeTo, x, y, ignoreMouse, onClose, children} = this.props;
        const contentStyle = {
            zIndex: 1,
            borderRadius: 5,
            backgroundColor: BACKGROUND_COLOR,
            marginTop: ARROW_SIZE,
            pointerEvents: ignoreMouse ? "none" : "auto"
        };

        return (
        <PrecisePopover
            relativeTo={relativeTo}
            x={x} y={y}
            arrowStyle={ARROW_STYLE}
            contentStyle={contentStyle}
            onClose={onClose}
        >
            {children}
        </PrecisePopover>
        );
    }
}

export default Tooltip;
