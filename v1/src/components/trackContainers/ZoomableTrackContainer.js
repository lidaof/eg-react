import React from 'react';
import PropTypes from 'prop-types';
import SelectableArea from '../SelectableArea';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import LinearDrawingModel from '../../model/LinearDrawingModel';

/**
 * Track container where the tracks can be dragged and dropped.
 * 
 * @author Silas Hsu
 */
class ZoomableTrackContainer extends React.Component {
    static propTypes = {
        trackElements: PropTypes.arrayOf(PropTypes.object).isRequired, // Track components to render
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // View region of the tracks
        legendWidth: PropTypes.number.isRequired, // Width of the track legends

        /**
         * Callback for when a new region is selected.  Signature:
         *     (newStart: number, newEnd: number): void
         *         `newStart`: the absolute base number of the start of the new view interval
         *         `newEnd`: the absolute base number of the end of the new view interval
         */
        onNewRegion: PropTypes.func,
    };

    static defaultProps = {
        onNewRegion: () => undefined
    };

    constructor(props) {
        super(props);
        this.areaSelected = this.areaSelected.bind(this);
    }

    /**
     * Fires the callback signaling a new region has been selected.
     * 
     * @param {number} startX - the left X coordinate of the selected area
     * @param {number} endX - the right X coordinate of the selected area
     * @param {React.SyntheticEvent} event - the final mouse event that triggered the selection
     */
    areaSelected(startX, endX, event) {
        const paneWidth = event.currentTarget.clientWidth;
        const legendWidth = this.props.legendWidth;
        const drawModel = new LinearDrawingModel(this.props.viewRegion, paneWidth - legendWidth);
        const correctedStart = startX - legendWidth;
        const correctedEnd = endX - legendWidth;
        this.props.onNewRegion(drawModel.xToBase(correctedStart), drawModel.xToBase(correctedEnd));
    }

    /**
     * @inheritdoc
     */
    render() {
        // Add keys
        let modifiedTracks = this.props.trackElements.map((trackElement, index) => {
            const key = trackElement.props.trackModel ? trackElement.props.trackModel.getId() : index;
            const propsToMerge = {
                key: key,
            };
            return React.cloneElement(trackElement, propsToMerge);
        });

        return <SelectableArea onAreaSelected={this.areaSelected} >{modifiedTracks}</SelectableArea>;
    }
}

export default ZoomableTrackContainer;
