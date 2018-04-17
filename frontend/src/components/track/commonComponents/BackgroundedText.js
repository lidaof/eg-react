import React from 'react';
import PropTypes from 'prop-types';

/**
 * SVG <text> element with background color.  For performance reasons, this component guesses the text dimensions 
 * rather than measuring the text's bounding box.  It is reasonably good at this estimation; nonetheless, we are dealing
 * with a guess, so the background box may not be completely accurate.
 * 
 * @author Silas Hsu
 */
class BackgroundedText extends React.Component {
    static propTypes = {
        // Props that are associated with <text>
        x: PropTypes.number, // x location of the text
        y: PropTypes.number, // y location of the text
        alignmentBaseline: PropTypes.oneOf(["hanging", "middle", "baseline"]), // Vertical alignment of text
        textAnchor: PropTypes.oneOf(["start", "middle", "end"]), // Horizontal alignment of text
        children: PropTypes.string, // The actual text to display
        // fontSize: the only INVALID prop - use `height` instead

        // Special props for this component
        height: PropTypes.number, // Height of the text - use instead of fontSize
        horizontalPadding: PropTypes.number, // Horizontal padding of background box
        backgroundColor: PropTypes.string, // Color of the background.  By default, renders no background.
        backgroundOpacity: PropTypes.number, // Opacity of the background
    };

    static defaultProps = {
        x: 0,
        y: 0,
        alignmentBaseline: "baseline",
        textAnchor: "start",
        children: "",

        height: 12,
        horizontalPadding: 2,
    };

    estimateTextWidth() {
        return this.props.children.length * this.props.height;
    }

    getRectX() {
        const {x, horizontalPadding, textAnchor} = this.props;
        const estimatedTextWidth = this.estimateTextWidth();
        let textStartX;
        if (textAnchor === "end") {
            textStartX = x - estimatedTextWidth;
        } else if (textAnchor === "middle") {
            textStartX = x - 0.5 * estimatedTextWidth;
        } else { // textAnchor === "start"
            textStartX = x;
        }
        return textStartX - horizontalPadding;
    }

    getRectY() {
        const {y, height, alignmentBaseline} = this.props;
        let textTopY;
        if (alignmentBaseline === "hanging") {
            textTopY = y;
        } else if (alignmentBaseline === "middle") {
            textTopY = y - 0.5 * height;
        } else { // alignmentBaseline === "baseline"
            textTopY = y - height;
        }
        return textTopY;
    }

    render() {
        const {height, horizontalPadding, backgroundColor, backgroundOpacity, fontSize, ...textProps} = this.props;
        if (fontSize) {
            console.warn("The `fontSize` prop is invalid.  Use the `height` prop to set font size.");
        }

        let background = null;
        if (backgroundColor && backgroundOpacity > 0) {
            background = <rect
                x={this.getRectX()}
                y={this.getRectY()}
                width={this.estimateTextWidth() + 2 * horizontalPadding}
                height={height}
                fill={backgroundColor}
                opacity={backgroundOpacity}
            />;
        }

        return <React.Fragment>{background} <text {...textProps} fontSize={1.5 * height} /></React.Fragment>;
    }
}

export default BackgroundedText;
