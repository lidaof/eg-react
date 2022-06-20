import React from 'react';
import PropTypes from 'prop-types';

import Chromosomes from './Chromosomes';
import Ruler from './Ruler';
import SelectedRegionBox from './SelectedRegionBox';

import { SelectableGenomeArea } from '../SelectableGenomeArea';
import { RegionPanTracker } from '../RegionPanTracker';
import withAutoDimensions from '../withAutoDimensions';
import withCurrentGenome from '../withCurrentGenome';

import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import { MouseButton } from '../../util';
import OpenInterval from '../../model/interval/OpenInterval';

import './MainPane.css';

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
        containerWidth: PropTypes.number.isRequired, // The width of the pane
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // The current view

        /**
         * The region that the tracks are displaying
         */
        selectedRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,

        /**
         * Called when the user selects a new region to display.  Has the signature
         *     (newStart: number, newEnd: number): void
         *         `newStart`: the nav context coordinate of the start of the selected interval
         *         `newEnd`: the nav context coordinate of the end of the selected interval
         */
        onRegionSelected: PropTypes.func,

        /**
         * Called when the user wants to view a new region.
         *     (newStart: number, newEnd: number): void
         *         `newStart`: the nav context coordinate of the start of the interval for the pane to display next
         *         `newEnd`: the nav context coordinate of the end of the interval for the pane to display next
         */
        onNewViewRequested: PropTypes.func,

        /**
         * Called when the view should be zoomed.  Has the signature
         *     (amount: number, focusPoint: number)
         *         `amount`: amount to zoom
         *          `focusPoint`: focal point of the zoom, which is where the mouse was as % of the width of the SVG.
         */
        onZoom: PropTypes.func.isRequired,
        inContainer: PropTypes.bool,
    };

    static defaultProps = {
        onRegionSelected: () => undefined,
        onNewView: () => undefined
    };

    constructor(props) {
        super(props);
        this.mousewheel = this.mousewheel.bind(this);
    }

    componentRef = React.createRef();

    componentDidMount() {
        if (this.componentRef.current) {
            this.componentRef.current.addEventListener('wheel', this.mousewheel);
        }
    }

    componentWillUnmount() {
        if (this.componentRef.current) {
            this.componentRef.current.removeEventListener('wheel', this.mousewheel);
        }
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
     * Places a <svg> and children that draw things.
     * 
     * @override
     */
    render() {
        const {containerWidth, viewRegion, selectedRegion, onNewViewRequested, onRegionSelected, genomeConfig } = this.props;
        if (containerWidth === 0) {
            if (process.env.NODE_ENV !== "test") {
                console.warn("Cannot render with a width of 0");
            }
            return null;
        }

        // Order of components matters; components listed later will be drawn IN FRONT of ones listed before
        return (
        <RegionPanTracker
            className="MainPane MainPane-opaque"
            mouseButton={MouseButton.RIGHT}
            onViewDrag={onNewViewRequested}
            panRegion={viewRegion}
        >
            <SelectableGenomeArea
                selectableRegion={viewRegion}
                dragLimits={new OpenInterval(0, containerWidth)}
                y={SELECT_BOX_Y}
                height={SELECT_BOX_HEIGHT}
                onRegionSelected={onRegionSelected}
            >
                <svg
                    width="100%"
                    height={SVG_HEIGHT}
                    onContextMenu={event => event.preventDefault()}
                    style={this.props.inContainer ? { borderBottom: "1px solid black" } :{border: "1px solid black"}}
                    ref={this.componentRef}
                >
                    <Chromosomes genomeConfig={genomeConfig} viewRegion={viewRegion} width={containerWidth} y={CHROMOSOME_Y} />
                    <Ruler viewRegion={viewRegion} width={containerWidth} y={RULER_Y} />
                    <SelectedRegionBox
                        width={containerWidth}
                        viewRegion={viewRegion}
                        selectedRegion={selectedRegion}
                        onNewViewRequested={onNewViewRequested}
                        y={SELECTED_BOX_Y}
                    />
                </svg>
            </SelectableGenomeArea>
        </RegionPanTracker>
        );
    }
}

export default withAutoDimensions(MainPane);
