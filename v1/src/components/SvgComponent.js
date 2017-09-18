import DisplayedRegionModel from '../model/DisplayedRegionModel';
import LinearDrawingModel from '../model/LinearDrawingModel';
import PropTypes from 'prop-types';
import React from 'react';
import SVG from 'svg.js';

/**
 * A React component that relies on SVG.js to draw.  Additionally, this component relies on {@link LinearDrawingModel},
 * which is used to convert pixels to bases and vice-versa.
 * 
 * In order to support responsive SVG drawing, this component requires a <svg> already in the DOM that SVG.js created.
 * The constructor automatically creates a <group> element in the SVG.  It is recommended to manipulate `this.group`
 * rather than `this.svg`, to take advantage of the `applyOffset()` and `componentWillUnmount()` methods and to
 * make element management easier.
 * 
 * @author Silas Hsu
 */
class SvgComponent extends React.Component {
    /**
     * Creates a new SVG group to draw in.
     */
    constructor(props) {
        super(props);
        this.svg = SVG.adopt(this.props.svgNode);
        this.group = this.svg.group();
        if (props.xOffset !== 0 || props.yOffset !== 0) {
            this.applyOffset(props);
        }
    }

    /**
     * Reads `props.xOffset` and `props.yOffset` and translates this component accordingly.
     * @param {Object} props 
     */
    applyOffset(props) {
        this.group.transform({x: this.props.xOffset, y: this.props.yOffset});
    }

    /**
     * Applies offset if it has changed.
     * 
     * @param {any} nextProps - next props that the component will receive
     * @override
     */
    componentWillUpdate(nextProps) {
        if (this.props.xOffset !== nextProps.xOffset || this.props.yOffset !== nextProps.yOffset) {
            this.applyOffset(nextProps);
        }
    }

    /**
     * Removes this component's <group> from the SVG.
     * 
     * @override
     */
    componentWillUnmount() {
        this.group.remove();
    }

    /**
     * By default, does nothing.  SVG manipulation should be put in here, and as a React render() method, child
     * components can be returned as well.
     * 
     * @return {null} null
     * @override
     */
    render() {
        return null;
    }
}

SvgComponent.propTypes = {
    // Since jsdom doesn't know what SVG is, we comment this out.  Don't worry, it because apparent VERY quickly if
    // this.props.svgNode is ever undefined.
    //svgNode: PropTypes.instanceOf(SVGElement).isRequired,
    model: PropTypes.instanceOf(DisplayedRegionModel),
    drawModel: PropTypes.instanceOf(LinearDrawingModel),
    xOffset: PropTypes.number,
    yOffset: PropTypes.number,
}

SvgComponent.defaultProps = {
    xOffset: 0,
    yOffset: 0,
}

export default SvgComponent;
