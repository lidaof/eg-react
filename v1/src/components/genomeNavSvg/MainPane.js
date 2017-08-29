import Chromosomes from './Chromosomes';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import PropTypes from 'prop-types';
import React from 'react';
import Ruler from './Ruler';
import SelectedRegionBox from './SelectedRegionBox';
import SelectionBox from './SelectionBox';
import SvgComponent from './SvgComponent';

const WHEEL_ZOOM_SPEED = 0.2;
const DRAG_VIEW_BUTTON = 2; // Right mouse
// FYI, {0: left mouse, 1: middle mouse, 2: right mouse}

const CHROMOSOME_Y = 30;
const SELECT_BOX_Y = 20;
const SELECTED_BOX_Y = 30;
const RULER_Y = CHROMOSOME_Y + 40;

/**
 * The main pane of the genome navigator.  Manages child components and listens for events that modify the view region.
 * 
 * @author Silas Hsu
 * @extends SvgComponent 
 */
class MainPane extends SvgComponent {
    /**
     * Does setup and binds event listeners.
     * 
     * @param {Object} props - props as specified by React
     */
    constructor(props) {
        super(props);
        this.dragOrigin = null;
        this.props.svg.on('contextmenu', event => event.preventDefault());
        this.props.svg.on('mousedown', this.mousedown, this);
        this.props.svg.on('mousemove', this.mousemove, this);
        this.props.svg.on('mouseup', this.mouseupOrMouseleave, this);
        this.props.svg.on('mouseleave', this.mouseupOrMouseleave, this);
        this.props.svg.on('wheel', this.mousewheel, this);
    }

    /**
     * Instead of translating this.group, translates the entire svg.
     * 
     * @override
     */
    applyOffset() {
        let x = this.props.xOffset || 0;
        let y = this.props.yOffset || 0;
        this.props.svg.transform({x: x, y: y});
    }

    /**
     * Initializes the region selection box or view dragging, depending on what mouse button was pressed down.  Once a
     * region selection box is created, it manages mouse events on its own (see {@link SelectionBox}).
     * 
     * @param {MouseEvent} event - a mousedown event fired from within this pane
     */
    mousedown(event) {
        event.preventDefault();
        if (event.button === DRAG_VIEW_BUTTON) {
            this.dragOrigin = {x: event.clientX, model: this.props.model};
        }
    }

    /**
     * If view dragging has been initialized, calcuates a new view region depending on where the mouse has been dragged.
     * 
     * @param {MouseEvent} event - a mousemove event fired from within this pane
     */
    mousemove(event) {
        if (this.dragOrigin) { // this.dragOrigin is set to a non-null object by this.mousedown
            let baseDiff = this.xWidthToBases(this.dragOrigin.x - event.clientX);
            let origRegion = this.dragOrigin.model.getAbsoluteRegion();
            this.props.dragCallback(
                origRegion.start + baseDiff,
                origRegion.end + baseDiff
            );
        }
    }

    /**
     * Uninitializes view dragging; stops tracking mousemove events.
     * 
     * @param {MouseEvent} event - a mouseup or mouseleave event fired from within this pane
     */
    mouseupOrMouseleave(event) {
        this.dragOrigin = null;
    }

    /**
     * Zooms the view depending on the user's mousewheel action
     * 
     * @param {WheelEvent} event - a wheel event fired from within this pane
     */
    mousewheel(event) {
        event.preventDefault();
        this.mouseupOrMouseleave();

        let svgWidth = this.getSvgWidth();
        let focusPoint = event.clientX / svgWidth; // Proportion-based, not base-based.
        if (event.deltaY > 0) { // Mouse wheel turned towards user, or spun downwards -- zoom out
            this.props.zoomCallback(1 + WHEEL_ZOOM_SPEED, focusPoint);
        } else if (event.deltaY < 0) { // Zoom in
            this.props.zoomCallback(1 - WHEEL_ZOOM_SPEED, focusPoint);
        }
    }

    /**
     * Doesn't draw anything by itself, but places child SvgComponents that *do* draw things.
     * 
     * @override
     */
    render() {
        // Order of components matters here; components listed later will be drawn IN FRONT of ones listed before
        return (
        <div>
            <Chromosomes svg={this.props.svg} model={this.props.model} yOffset={CHROMOSOME_Y} />
            <Ruler svg={this.props.svg} model={this.props.model} yOffset={RULER_Y} />
            <SelectedRegionBox
                svg={this.props.svg}
                model={this.props.model}
                selectedRegionModel={this.props.selectedRegionModel}
                gotoButtonCallback={this.props.gotoButtonCallback}
                yOffset={SELECTED_BOX_Y}
            />
            <SelectionBox
                svg={this.props.svg}
                model={this.props.model}
                regionSelectedCallback={this.props.regionSelectedCallback}
                yOffset={SELECT_BOX_Y}
            />
        </div>
        );
    }
}

MainPane.propTypes = {
    selectedRegionModel: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
    regionSelectedCallback: PropTypes.func.isRequired, // All callbacks take arguments [number, number]
    dragCallback: PropTypes.func.isRequired,
    gotoButtonCallback: PropTypes.func.isRequired,
    zoomCallback: PropTypes.func.isRequired,
}

export default MainPane;
