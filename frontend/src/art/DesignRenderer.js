import React from 'react'
import PropTypes from 'prop-types';

export const RenderTypes = {
    CANVAS: 0,
    SVG: 1,
};

const DEFAULT_STYLE = { display: "block" }; // display: block prevents extra bottom padding in both svg and canvas

/**
 * A component that renders SVG elements in a flexible way: in a <svg>, in a <canvas>, etc.
 * 
 * @author Silas Hsu
 */
export class DesignRenderer extends React.PureComponent {
    static propTypes = {
        type: PropTypes.oneOf([RenderTypes.CANVAS, RenderTypes.SVG]),
        style: PropTypes.object, // CSS.  Will be merged with default styles.
        // Remaining props get passed directly to the rendered element
    };

    static defaultProps = {
        type: RenderTypes.SVG
    };

    render() {
        const {type, style, ...otherProps} = this.props;
        const mergedStyle = Object.assign({}, DEFAULT_STYLE, style);
        switch (type) {
            case RenderTypes.CANVAS:
                return <CanvasDesignRenderer {...otherProps} style={mergedStyle} />;
            case RenderTypes.SVG:
                return <svg {...otherProps} style={mergedStyle} />;
            default:
                return null;
        }
    }
}

/**
 * Component that replicates draws its children the best it can on a <canvas>.  Any props are passed directly to the
 * <canvas>.
 * 
 * @author Silas Hsu
 */
class CanvasDesignRenderer extends React.PureComponent {
    /**
     * Draws the canvas.
     */
    componentDidMount() {
        this.draw(this.canvasNode);
    }

    /**
     * Redraws the canvas.
     */
    componentDidUpdate(prevProps) {
        this.draw(this.canvasNode);
    }

    drawOneElement(context, element) {
        if (!element) {
            return; // Do nothing
        }
        if (Array.isArray(element)) {
            element.forEach(element => this.drawOneElement(context, element));
            return;
        }
        const props = element.props;
        switch (element.type) {
            case 'rect':
                context.fillStyle = props.fill;
                context.globalAlpha = props.fillOpacity || 1;
                context.fillRect(props.x, props.y, props.width, props.height);
                break;
            case 'g':
                React.Children.forEach(props.children, child => this.drawOneElement(context, child));
                break;
            case undefined:
                break;
            default:
                console.error(`Drawing '${element.type}'s is unsupported.  Ignoring...`);
        }
    }

    /**
     * Redraws the canvas.
     */
    draw(canvas) {
        if (process.env.NODE_ENV === "test") { // jsdom does not support canvas
            return;
        }

        let context = this.canvasNode.getContext("2d");
        context.clearRect(0, 0, this.canvasNode.width, this.canvasNode.height); // Clear the canvas

        this.props.children.forEach(element => this.drawOneElement(context, element));
    }

    render() {
        const {children, ...otherProps} = this.props;
        return <canvas ref={node => this.canvasNode = node} {...otherProps} />;
    }
}

export default DesignRenderer;
