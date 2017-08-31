import DisplayedRegionModel from '../model/DisplayedRegionModel';
import MainPane from './genomeNavSvg/MainPane';
import PropTypes from 'prop-types';
import React from 'react';
import SvgContainer from './SvgContainer';
import TrackRegionController from './TrackRegionController';
import _ from 'lodash';

const MIN_REGION_LENGTH = 80; // Minimum region length, where zooming is not allowed anymore
const DEFAULT_VIEW_REGION = [15000000, 25000000]; // TODO calculate this dynamically, or get it from this.props

/**
 * A navigator that allows users to scroll around the genome and select what region for tracks to display.  Relies on
 * SVG.js to render much of the UI.
 * 
 * @extends {React.Component}
 * @author Silas Hsu
 */
class GenomeNavigator extends React.Component {
    /**
     * @inheritdoc 
     */
    constructor(props) {
        super(props);
        this.id = _.uniqueId();
        this.state = {
            model: new DisplayedRegionModel("meow", this.props.chromosomes),
        }
        this.state.model.setRegion(...DEFAULT_VIEW_REGION);

        this.zoom = this.zoom.bind(this);
        this.setNewView = this.setNewView.bind(this);
        this.zoomSliderDragged = this.zoomSliderDragged.bind(this);
    }

    /**
     * Deep copies this.state.model, mutates it by calling `methodName` with `args`, and then calls this.setState().
     * 
     * @param {string} methodName - the method to call on the model
     * @param {any[]} args - arguments to provide to the method
     */
    _setModelState(methodName, args) {
        let modelCopy = _.cloneDeep(this.state.model);
        modelCopy[methodName].apply(modelCopy, args);
        this.setState({model: modelCopy});
    }

    /**
     * Wrapper for calling zoom() on the view model.
     * 
     * @param {number} amount - amount to zoom
     * @param {number} focusPoint - focal point of the zoom
     * @see DisplayedRegionModel#zoom
     */
    zoom(amount, focusPoint) {
        if (amount < 1 && this.state.model.getWidth() <= MIN_REGION_LENGTH) {
            return;
        }
        this._setModelState("zoom", [amount, focusPoint]);
    }

    /**
     * Wrapper for calling setRegion() on the view model
     * 
     * @param {number} newStart - start absolute base number
     * @param {number} newEnd - end absolute base number
     * @see DisplayedRegionModel#setRegion
     */
    setNewView(newStart, newEnd) {
        this._setModelState("setRegion", [newStart, newEnd, true]);
    }

    /**
     * Zooms the view to the right level when the zoom slider is dragged.
     * 
     * @param {React.SyntheticEvent} event - the event that react fired when the zoom slider was changed
     */
    zoomSliderDragged(event) {
        let targetRegionSize = Math.exp(event.target.value);
        let proportion = targetRegionSize / this.state.model.getWidth();
        this._setModelState("zoom", [proportion]);
    }

    /**
     * @inheritdoc
     */
    render() {
        return (
            <div style={{padding: "20px"}}>
                <label>
                    Zoom:
                    <input
                        type="range"
                        min={Math.log(MIN_REGION_LENGTH)}
                        max={Math.log(this.state.model.getGenomeLength())}
                        step="any"
                        value={Math.log(this.state.model.getWidth())}
                        onChange={this.zoomSliderDragged}
                    />
                </label>
                <TrackRegionController
                    model={this.props.selectedRegionModel}
                    newRegionCallback={this.props.regionSelectedCallback}
                />

                {/* This div will hold the actual svg element; SVG.js adds it in componentDidMount() */}
                <SvgContainer>
                    <MainPane
                        model={this.state.model}
                        selectedRegionModel={this.props.selectedRegionModel}
                        regionSelectedCallback={this.props.regionSelectedCallback}
                        dragCallback={this.setNewView}
                        gotoButtonCallback={this.setNewView}
                        zoomCallback={this.zoom}
                    />
                </SvgContainer>
            </div>
        );
    }
}

GenomeNavigator.propTypes = {
    chromosomes: PropTypes.arrayOf(PropTypes.object).isRequired,
    selectedRegionModel: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
    regionSelectedCallback: PropTypes.func.isRequired, // Function that takes arguments [number, number]
}

export default GenomeNavigator;
