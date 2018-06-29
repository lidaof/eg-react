import React from 'react';
import PropTypes from 'prop-types';
import SelectableGenomeArea from '../SelectableGenomeArea';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import LinearDrawingModel from '../../model/LinearDrawingModel';

/**
 * Track container where the tracks can be dragged and dropped.
 * 
 * @author Silas Hsu
 */
class ZoomableTrackContainer extends React.Component {
    static propTypes = {
        visualizationStartX: PropTypes.number.isRequired, // Relative X of the left edge of track visualizers
        visualizationWidth: PropTypes.number.isRequired, // Width of the track visualizers
        trackElements: PropTypes.arrayOf(PropTypes.object).isRequired, // Track components to render
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // View region of the tracks

        /**
         * Callback for when a new region is selected.  Signature:
         *     (newStart: number, newEnd: number): void
         *         `newStart`: the nav context coordinate of the start of the new view interval
         *         `newEnd`: the nav context coordinate of the end of the new view interval
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
        const {visualizationStartX, visualizationWidth, viewRegion} = this.props;
        const drawModel = new LinearDrawingModel(viewRegion, visualizationWidth);
        const correctedStart = startX - visualizationStartX;
        const correctedEnd = endX - visualizationStartX;
        this.props.onNewRegion(drawModel.xToBase(correctedStart), drawModel.xToBase(correctedEnd));
    }

    /**
     * @inheritdoc
     */
    render() {
        return (
        <SelectableGenomeArea
            drawModel={new LinearDrawingModel(this.props.viewRegion, this.props.visualizationWidth)}
            onAreaSelected={this.areaSelected}
        >
            {this.props.trackElements}
        </SelectableGenomeArea>
        );
    }
}

export default ZoomableTrackContainer;
