import React from 'react';
import PropTypes from 'prop-types';

import Chromosomes from './Chromosomes';
import Ruler from './Ruler';
import SelectedRegionBox from './SelectedRegionBox';

import SelectableGenomeArea from '../SelectableGenomeArea';
import DragAcrossView from '../DragAcrossView';
import withAutoDimensions from '../withAutoDimensions';

import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import LinearDrawingModel from '../../model/LinearDrawingModel';
import { MouseButtons } from '../../util';

const WHEEL_ZOOM_SPEED = 0.2;
const SVG_HEIGHT = 100;

const CHROMOSOME_Y = 10;
const SELECTED_BOX_Y = 10;
const RULER_Y = CHROMOSOME_Y + 30;

const SELECT_BOX_Y = "5px";
const SELECT_BOX_HEIGHT = "60px";

/**
 * The main pane of the genome navigator.  Manages child components and listens for events that modify the view region.
 * 
 * @author Silas Hsu
 */
class MainPane extends React.Component {
    static propTypes = {
        width: PropTypes.number.isRequired, // The width of the pane
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // The current view

        /**
         * The region that the tracks are displaying
         */
        selectedRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,

        /**
         * Called when the user selects a new region to display.  Has the signature
         *     (newStart: number, newEnd: number): void
         *         `newStart`: the absolute base number of the start of the selected interval
         *         `newEnd`: the absolute base number of the end of the selected interval
         */
        onRegionSelected: PropTypes.func,

        /**
         * Called when the user wants to view a new region.
         *     (newStart: number, newEnd: number): void
         *         `newStart`: the absolute base number of the start of the interval for the pane to display next
         *         `newEnd`: the absolute base number of the end of the interval for the pane to display next
         */
        onNewViewRequested: PropTypes.func,

        /**
         * Called when the view should be zoomed.  Has the signature
         *     (amount: number, focusPoint: number)
         *         `amount`: amount to zoom
         *          `focusPoint`: focal point of the zoom, which is where the mouse was as % of the width of the SVG.
         */
        onZoom: PropTypes.func.isRequired,
    };

    static defaultProps = {
        onRegionSelected: () => undefined,
        onNewView: () => undefined
    };

    constructor(props) {
        super(props);
        this.mousewheel = this.mousewheel.bind(this);
        this.areaSelected = this.areaSelected.bind(this);
    }

    /**
     * Zooms the view depending on the user's mousewheel action
     * 
     * @param {React.SyntheticEvent} event - a wheel event fired from within this pane
     */
    mousewheel(event) {
        event.preventDefault();
        let paneWidth = event.currentTarget.clientWidth || event.currentTarget.parentNode.clientWidth;
        let focusPoint = event.clientX / paneWidth; // Proportion-based, not base-based.
        if (event.deltaY > 0) { // Mouse wheel turned towards user, or spun downwards -- zoom out
            this.props.onZoom(1 + WHEEL_ZOOM_SPEED, focusPoint);
        } else if (event.deltaY < 0) { // Zoom in
            this.props.onZoom(1 - WHEEL_ZOOM_SPEED, focusPoint);
        }
    }

    /**
     * Fires the callback signaling a new region has been selected.
     * 
     * @param {number} startX - the left X coordinate of the selected area
     * @param {number} endX - the right X coordinate of the selected area
     * @param {React.SyntheticEvent} event - the final mouse event that triggered the selection
     */
    areaSelected(startX, endX, event) {
        const drawModel = new LinearDrawingModel(this.props.viewRegion, this.props.width);
        this.props.onRegionSelected(drawModel.xToBase(startX), drawModel.xToBase(endX));
    }

    /**
     * Places a <svg> and children that draw things.
     * 
     * @override
     */
    render() {
        const {width, viewRegion, selectedRegion, onNewViewRequested} = this.props;
        if (width === 0) {
            if (process.env.NODE_ENV !== "test") {
                console.warn("Cannot render with a width of 0");
            }
            return null;
        }

        // Order of components matters; components listed later will be drawn IN FRONT of ones listed before
        return (
        <DragAcrossView button={MouseButtons.RIGHT} onViewDrag={onNewViewRequested} viewRegion={viewRegion} >
            <SelectableGenomeArea
                drawModel={new LinearDrawingModel(viewRegion, width)}
                y={SELECT_BOX_Y}
                height={SELECT_BOX_HEIGHT}
                onAreaSelected={this.areaSelected}
            >
                <svg
                    width={width}
                    height={SVG_HEIGHT}
                    onContextMenu={event => event.preventDefault()}
                    onWheel={this.mousewheel}
                    style={{border: "2px solid black"}}
                >
                    <Chromosomes viewRegion={viewRegion} width={width} y={CHROMOSOME_Y} />
                    <Ruler viewRegion={viewRegion} width={width} y={RULER_Y} />
                    <SelectedRegionBox
                        width={width}
                        viewRegion={viewRegion}
                        selectedRegion={selectedRegion}
                        onNewViewRequested={onNewViewRequested}
                        y={SELECTED_BOX_Y}
                    />
                </svg>
            </SelectableGenomeArea>
        </DragAcrossView>
        );
    }
}

export default withAutoDimensions(MainPane);
