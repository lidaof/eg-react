import { LEFT_MOUSE, RIGHT_MOUSE } from '../DomDragListener';
import Chromosomes from './Chromosomes';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import PropTypes from 'prop-types';
import React from 'react';
import Ruler from './Ruler';
import SelectedRegionBox from './SelectedRegionBox';
import SelectionBox from './SelectionBox';
import SvgContainer from '../SvgContainer';
import ViewDragListener from '../ViewDragListener';

const WHEEL_ZOOM_SPEED = 0.2;

const CHROMOSOME_Y = 30;
const SELECT_BOX_Y = 20;
const SELECTED_BOX_Y = 30;
const RULER_Y = CHROMOSOME_Y + 40;

/**
 * The main pane of the genome navigator.  Manages child components and listens for events that modify the view region.
 * 
 * @author Silas Hsu
 * @extends React.Component
 */
class MainPane extends React.Component {
    static propTypes = {
        model: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // The current view

        /**
         * The region that the tracks are displaying
         */
        selectedRegionModel: PropTypes.instanceOf(DisplayedRegionModel).isRequired,

        /**
         * Called when the user selects a new region to display.  Has the signature
         *     (newStart: number, newEnd: number): void
         *         `newStart`: the absolute base number of the start of the selected interval
         *         `newEnd`: the absolute base number of the end of the selected interval
         */
        regionSelectedCallback: PropTypes.func.isRequired,

        /**
         * Called during dragging.  Has the signature
         *     (newStart: number,
         *      newEnd: number,
         *      event: MouseEvent,
         *      coordinateDiff: {dx: number, dy: number}
         *     ): void
         *         `newStart`: the absolute base number of the start of the view region if it were centered on the mouse
         *         `newEnd`: the absolute base number of the end of the view region if it were centered on the mouse
         *         `event`: the MouseEvent that triggered this event
         *         `coordinateDiff`: the location of the mouse relative to where the drag started
         */
        dragCallback: PropTypes.func.isRequired,
        
        /**
         * Called when the user presses the "GOTO" button to quicky scroll the view to the selected track region.
         *     (newStart: number, newEnd: number): void
         *         `newStart`: the absolute base number of the start of the interval to scroll to
         *         `newEnd`: the absolute base number of the end of the interval to scroll to
         */
        gotoButtonCallback: PropTypes.func.isRequired,

        /**
         * Called when the view should be zoomed.  Has the signature
         *     (amount: number, focusPoint: number)
         *         `amount`: amount to zoom
        *          `focusPoint`: focal point of the zoom, which is where the mouse was as % of the width of the SVG.
         */
        zoomCallback: PropTypes.func.isRequired,
    }

    /**
     * Does setup and binds event listeners.
     * 
     * @param {Object} props - props as specified by React
     */
    constructor(props) {
        super(props);
        this.svgNode = null;
        this.mousewheel = this.mousewheel.bind(this);
    }

    /**
     * Zooms the view depending on the user's mousewheel action
     * 
     * @param {WheelEvent} event - a wheel event fired from within this pane
     */
    mousewheel(event) {
        event.preventDefault();
        let svgWidth = this.svgNode.clientWidth;
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
        <SvgContainer
            model={this.props.model}
            svgProps={{
                onContextMenu: event => event.preventDefault(),
                onWheel: this.mousewheel,
                style: {border: "1px solid black"},
                ref: node => this.svgNode = node
            }}
        >
            <ViewDragListener button={RIGHT_MOUSE} onViewDrag={this.props.dragCallback} model={this.props.model} />
            <Chromosomes yOffset={CHROMOSOME_Y} model={this.props.model} />
            <Ruler yOffset={RULER_Y} model={this.props.model} />
            <SelectedRegionBox
                selectedRegionModel={this.props.selectedRegionModel}
                model={this.props.model}
                gotoButtonCallback={this.props.gotoButtonCallback}
                yOffset={SELECTED_BOX_Y}
            />
            <SelectionBox
                button={LEFT_MOUSE}
                regionSelectedCallback={this.props.regionSelectedCallback}
                yOffset={SELECT_BOX_Y}
            />
        </SvgContainer>
        );
    }
}

export default MainPane;
