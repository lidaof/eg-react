import React from 'react';
import PropTypes from 'prop-types';

const ARROW_WIDTH = 5;
const ARROW_SEPARATION = 12;

/**
 * A series of evenly-spaced arrows on a horizontal axis.  Renders SVG elements.
 * 
 * @author Silas Hsu
 */
class AnnotationArrows extends React.PureComponent {
    static propTypes = {
        startX: PropTypes.number.isRequired, // X location to start drawing arrows
        endX: PropTypes.number.isRequired, // X location to stop drawing arrows
        y: PropTypes.number, // y location to draw arrows
        height: PropTypes.number.isRequired, // Height of arrows
        isToRight: PropTypes.bool, // Arrow point direction.  If true, point right; otherwise, point left.
        color: PropTypes.string, // Color of the arrows
        /**
         * Id for a clipPath element.  If valid, arrows will only appear in the clipPath's region.
         */
        clipId: PropTypes.string,
        opacity: PropTypes.number
    };
    static defaultProps = {
        y: 0,
        opacity: 1,
    };

    render() {
        const {startX, endX, y, height, isToRight, color, clipId, opacity} = this.props;
        if (endX - startX < ARROW_WIDTH) {
            return null;
        }

        const centerY = height / 2;
        const bottomY = height;
        let placementStartX = startX;
        let placementEndX = endX;
        if (isToRight) {
            placementStartX += ARROW_WIDTH;
        } else {
            placementEndX -= ARROW_WIDTH;
        }

        let children = [];
        // Naming: if our arrows look like '<', then the tip is on the left, and the two tails are on the right.
        for (let arrowTipX = placementStartX; arrowTipX <= placementEndX; arrowTipX += ARROW_SEPARATION) {
            // Is forward strand ? point to the right : point to the left 
            const arrowTailX = isToRight ? arrowTipX - ARROW_WIDTH : arrowTipX + ARROW_WIDTH;
            const arrowPoints = [
                [arrowTailX, y + 1],
                [arrowTipX, centerY + y],
                [arrowTailX, bottomY + y - 1]
            ];
            children.push(<polyline
                key={arrowTipX}
                points={arrowPoints}
                fill="none"
                stroke={color}
                strokeWidth={1}
                strokeOpacity={opacity}
                clipPath={clipId ? `url(#${clipId})` : undefined}
            />);
        }
        return children;
    }
}

export default AnnotationArrows;
