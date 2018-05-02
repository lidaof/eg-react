import React from 'react';
import PropTypes from 'prop-types';
import { getRelativeCoordinates } from '../../util';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';

const ZOOM_AMOUNT = 1.75;

/**
 * A track container that zooms out on click.
 * 
 * @author Silas Hsu
 */
class ZoomOutTrackContainer extends React.PureComponent {
    static propTypes = {
        trackElements: PropTypes.arrayOf(PropTypes.node).isRequired, // Track elements to render
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // Current view region
        /**
         * Callback for when a new region is selected.  Signature:
         *     (newStart: number, newEnd: number): void
         *         `newStart`: the absolute base number of the start of the new view interval
         *         `newEnd`: the absolute base number of the end of the new view interval
         */
        onNewRegion: PropTypes.func
    };

    constructor(props) {
        super(props);
        this.zoomOutAtClick = this.zoomOutAtClick.bind(this);
    }

    /**
     * Requests a zoom out, focused on where the mouse clicked.
     * 
     * @param {MouseEvent} event - click event
     */
    zoomOutAtClick(event) {
        if (!this.props.onNewRegion) {
            return;
        }
        const x = getRelativeCoordinates(event).x;
        const focusPoint = x / event.currentTarget.clientWidth;
        const newRegion = this.props.viewRegion.clone().zoom(ZOOM_AMOUNT, focusPoint);
        this.props.onNewRegion(...newRegion.getAbsoluteRegion());
    }

    render() {
        return <div onClick={this.zoomOutAtClick} >{this.props.trackElements}</div>;
    }
}

export default ZoomOutTrackContainer;
