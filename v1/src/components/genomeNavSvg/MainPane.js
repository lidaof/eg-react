import SvgComponent from './SvgComponent';
import Chromosomes from './Chromosomes';
import SelectedRegionBox from './SelectedRegionBox';
import SelectionBox from './SelectionBox';
import Ruler from './Ruler';
import React from 'react';

const WHEEL_ZOOM_SPEED = 0.15;

const LEFT_BUTTON = 0;
const RIGHT_BUTTON = 2;

const CHROMOSOME_Y = 30;
const SELECT_BOX_Y = 20;
const SELECTED_BOX_Y = 30;
const RULER_Y = CHROMOSOME_Y + 40;

class MainPane extends SvgComponent {
    constructor(props) {
        super(props);
        this.state = {
            selectBoxAnchorX: null,
        }

        this.dragOrigin = null;
        this.props.svg.on('contextmenu', event => event.preventDefault());
        this.props.svg.on('mousedown', this.mousedown, this);
        this.props.svg.on('mousemove', this.mousemove, this);
        this.props.svg.on('mouseup', this.mouseupOrMouseleave, this);
        this.props.svg.on('mouseleave', this.mouseupOrMouseleave, this);
        this.props.svg.on('wheel', this.mousewheel, this);
    }

    mousedown(event) {
        event.preventDefault();
        if (event.button === LEFT_BUTTON) { // Select a region
            this.setState({selectBoxAnchorX: this.domXToSvgX(event.clientX)});
        } else if (event.button === RIGHT_BUTTON) { // Drag view
            this.dragOrigin = {x: event.clientX, model: this.props.model};
        }
    }

    mousemove(event) {
        if (this.dragOrigin) { // Dragging the view around
            let baseDiff = this.xWidthToBases(this.dragOrigin.x - event.clientX);
            let origRegion = this.dragOrigin.model.getAbsoluteRegion();
            this.props.dragCallback(
                origRegion.start + baseDiff,
                origRegion.end + baseDiff
            );
        }
    }

    mouseupOrMouseleave(event) {
        this.dragOrigin = null;
    }

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

    regionSelected(startBase, endBase) {
        this.setState({selectBoxAnchorX: null});
        this.props.regionSelectedCallback(startBase, endBase);
    }

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
            {
                this.state.selectBoxAnchorX &&
                <SelectionBox
                    svg={this.props.svg}
                    model={this.props.model}
                    anchorX={this.state.selectBoxAnchorX}
                    regionSelectedCallback={this.regionSelected.bind(this)}
                    yOffset={SELECT_BOX_Y}
                />
            }
        </div>
        );
    }
}

export default MainPane;
