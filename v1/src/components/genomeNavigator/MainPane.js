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
        let svgWidth = this.svgNode.scrollWidth;
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
            onContextMenu={event => event.preventDefault()}
            onWheel={this.mousewheel}
            svgRef={(node) => this.svgNode = node}
            svgStyle={{border: "1px solid black"}}
        >
            <ViewDragListener model={this.props.model} button={RIGHT_MOUSE} onViewDrag={this.props.dragCallback} />
            <Chromosomes model={this.props.model} yOffset={CHROMOSOME_Y} />
            <Ruler model={this.props.model} yOffset={RULER_Y} />
            <SelectedRegionBox
                model={this.props.model}
                selectedRegionModel={this.props.selectedRegionModel}
                gotoButtonCallback={this.props.gotoButtonCallback}
                yOffset={SELECTED_BOX_Y}
            />
            <SelectionBox
                model={this.props.model}
                button={LEFT_MOUSE}
                regionSelectedCallback={this.props.regionSelectedCallback}
                yOffset={SELECT_BOX_Y}
            />
        </SvgContainer>
        );
    }
}

MainPane.propTypes = {
    model: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
    selectedRegionModel: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
    regionSelectedCallback: PropTypes.func.isRequired, // All callbacks take arguments [number, number]
    dragCallback: PropTypes.func.isRequired,
    gotoButtonCallback: PropTypes.func.isRequired,
    zoomCallback: PropTypes.func.isRequired,
}

export default MainPane;
