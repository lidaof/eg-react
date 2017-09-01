import DisplayedRegionModel from '../model/DisplayedRegionModel';
import LinearDrawingModel from '../model/LinearDrawingModel';
import PropTypes from 'prop-types';
import React from 'react';
import SVG from 'svg.js';

/**
 * A React component that relies on SVG.js to draw.  Additionally, this component requires a
 * {@link DisplayedRegionModel}, which is used in the helper functions that convert pixels to bases and vice-versa.
 * 
 * In order to support responsive SVG drawing, this component requires a <svg> already in the DOM that SVG.js created.
 * The constructor automatically creates a <group> element in the SVG.  It is recommended to manipulate `this.group`
 * rather than `this.svg`, to take advantage of the `applyOffset()` and `componentWillUnmount()` methods and to
 * make element management easier.
 * 
 * @extends React.Component
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
        this.scale = new LinearDrawingModel(this.props.model, this.props.svgNode);
        this.applyOffset(props);
    }

    /**
     * Reads `props.xOffset` and `props.yOffset` and translates this component accordingly.
     * @param {Object} props 
     */
    applyOffset(props) {
        let x = props.xOffset || 0;
        let y = props.yOffset || 0;
        this.group.transform({x: x, y: y});
    }

    /**
     * @inheritdoc
     */
    componentWillUpdate(nextProps) {
        if (this.props.xOffset !== nextProps.xOffset || this.props.yOffset !== nextProps.yOffset) {
            this.applyOffset(nextProps);
        }
        if (this.props.model !== nextProps.model) {
            this.scale = new LinearDrawingModel(nextProps.model, nextProps.svgNode);
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
     * @return {number} the width, in pixels, of this SVG.
     */
    getSvgWidth() {
        return this.svg.viewbox().width;
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
    model: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
    xOffset: PropTypes.number,
    yOffset: PropTypes.number,
}

export default SvgComponent;
