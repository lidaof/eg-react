import React from 'react'
import PropTypes from 'prop-types';

/**
 * Component that renders SVG elements on a canvas element.
 * 
 * @author Silas Hsu
 */
class CanvasDesignRenderer extends React.PureComponent {
    static propTypes = {
        design: PropTypes.arrayOf(PropTypes.object).isRequired, // Array of React.Component that are <svg> elements
    };

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

    /**
     * Redraws the canvas.
     */
    draw(canvas) {
        if (process.env.NODE_ENV === "test") { // jsdom does not support canvas
            return;
        }

        let context = this.canvasNode.getContext("2d");
        context.clearRect(0, 0, this.canvasNode.width, this.canvasNode.height); // Clear the canvas

        this.props.design.forEach(component => {
            const props = component.props;
            switch (component.type) {
                case 'rect':
                    context.fillStyle = props.fill;
                    context.fillRect(props.x, props.y, props.width, props.height);
                    break;
                default:
                    console.error(`Drawing '${component.type}'s is unsupported.  Ignoring...`);
            }
        });
    }

    /**
     * @inheritdoc
     */
    render() {
        const {design, ...otherProps} = this.props;
        return <canvas ref={node => this.canvasNode = node} {...otherProps} />;
    }
}

export default CanvasDesignRenderer;
