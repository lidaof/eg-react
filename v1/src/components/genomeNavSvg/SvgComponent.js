import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import PropTypes from 'prop-types';
import React from 'react';
import SVG from 'svg.js';

/**
 * A React component that relies on SVG.js to draw.  Additionally, this component requires a
 * {@link DisplayedRegionModel}, which is used in the helper functions that convert pixels to bases and vice-versa.
 * 
 * In order to support responsive SVG drawing, this component requires a <svg> already in the DOM that SVG.js created.
 * The constructor automatically creates a <group> element in the SVG.  It is recommended to manipulate `this.group`
 * rather than `this.props.svg`, to take advantage of the `applyOffset()` and `componentWillUnmount()` methods and to
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
        this.group = this.props.svg.group();
        this.applyOffset();
    }

    /**
     * Reads `this.props.xOffset` and `this.props.yOffset` and translates this component accordingly.
     */
    applyOffset() {
        let x = this.props.xOffset || 0;
        let y = this.props.yOffset || 0;
        this.group.transform({x: x, y: y});
    }

    /**
     * Calls this.applyOffset().
     */
    componentWillUpdate() {
        this.applyOffset();
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
     * @return {number} the width, in pixels, of this SVG's viewbox
     */
    getSvgWidth() {
        return this.props.svg.viewbox().width;
    }

    /**
     * Given a X coordinate on the webpage (such as those contained in MouseEvents), gets the X coordinate in the SVG.
     * 
     * @param {number} domX - the X coordinate on the webpage
     * @return {number} the X coordinate in the SVG
     */
    domXToSvgX(domX) {
        return domX - this.props.svg.node.getBoundingClientRect().left;
    }

    /*//////////
    Next four methods are x-to-base/base-to-x helpers that rely on this.props.model.  If in the future, we need the
    functionality of this class without these helpers, we can refactor them into a mixin or add another level in the
    class hierarchy.
    //////////*/

    /**
     * Gets the horizontal width in pixels required to represent a number of bases.
     * 
     * @param {number} bases - width in number of bases
     * @return {number} width in pixels
     */
    basesToXWidth(bases) {
        let pixelsPerBase = this.getSvgWidth() / this.props.model.getWidth();
        return bases * pixelsPerBase;
    }

    /**
     * Gets how many bases represented by a horizontal span of the SVG.
     * 
     * @param {number} pixels - width of a horizontal span
     * @return {number} width in number of bases
     */
    xWidthToBases(pixels) {
        let basesPerPixel = this.props.model.getWidth() / this.getSvgWidth();
        return pixels * basesPerPixel;
    }

    /**
     * Given an absolute base number, gets the X coordinate that represents that base.
     * 
     * @param {number} base - absolute base coordinate
     * @return {number} X coordinate that represents the input base
     */
    baseToX(base) {
        let pixelsPerBase = this.getSvgWidth() / this.props.model.getWidth();
        return (base - this.props.model.getAbsoluteRegion().start) * pixelsPerBase;
    }

    /**
     * Given an X coordinate representing a base, gets the absolute base number.
     * 
     * @param {number} pixel - X coordinate that represents a base
     * @return {number} absolute base coordinate
     */
    xToBase(pixel) {
        let basesPerPixel = this.props.model.getWidth() / this.getSvgWidth();
        return pixel * basesPerPixel + this.props.model.getAbsoluteRegion().start;
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
    svg: PropTypes.instanceOf(SVG.Container).isRequired,
    model: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
    xOffset: PropTypes.number,
    yOffset: PropTypes.number,
}

export default SvgComponent;
