import React from 'react';
import PropTypes from 'prop-types';

import MainPane from './MainPane';
import TrackRegionController from './TrackRegionController';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';

import eglogo from '../../images/eglogo.jpg';

const MIN_VIEW_LENGTH = 80; // Minimum region length, where zooming is not allowed anymore

/**
 * A navigator that allows users to scroll around the genome and select what region for tracks to display.
 * 
 * @extends {React.Component}
 * @author Silas Hsu
 */
class GenomeNavigator extends React.Component {
    static propTypes = {
        /**
         * The region that the tracks are displaying.
         */
        selectedRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,

        /**
         * Called when the user selects a new region to display.  Has the signature
         *     (newStart: number, newEnd: number): void
         *         `newStart`: the absolute base number of the start of the selected interval
         *         `newEnd`: the absolute base number of the end of the selected interval
         */
        regionSelectedCallback: PropTypes.func.isRequired,
    };

    /**
     * Binds functions, and also forks that view region that was passed via props.
     */
    constructor(props) {
        super(props);
        this.state = {
            viewRegion: new DisplayedRegionModel(this.props.selectedRegion.getNavigationContext())
        };

        this.zoom = this.zoom.bind(this);
        this.setNewView = this.setNewView.bind(this);
        this.zoomSliderDragged = this.zoomSliderDragged.bind(this);
    }

    /**
     * Resets the view region if a new one is received.
     * 
     * @param {any} nextProps - new props that this component will receive
     * @override
     */
    componentWillReceiveProps(nextProps) {
        const thisNavContext = this.state.viewRegion.getNavigationContext();
        const nextNavContext = nextProps.selectedRegion.getNavigationContext();
        if (thisNavContext !== nextNavContext) {
            this.setState({viewRegion: new DisplayedRegionModel(nextNavContext)});
        }
    }

    /**
     * Deep copies this.state.viewRegion, mutates it by calling `methodName` with `args`, and then calls this.setState().
     * 
     * @param {string} methodName - the method to call on the model
     * @param {any[]} args - arguments to provide to the method
     */
    _setModelState(methodName, args) {
        let regionCopy = this.state.viewRegion.clone();
        regionCopy[methodName].apply(regionCopy, args);
        this.setState({viewRegion: regionCopy});
    }

    /**
     * Wrapper for calling zoom() on the view model.
     * 
     * @param {number} amount - amount to zoom
     * @param {number} focusPoint - focal point of the zoom
     * @see DisplayedRegionModel#zoom
     */
    zoom(amount, focusPoint) {
        if (amount < 1 && this.state.viewRegion.getWidth() * amount <= MIN_VIEW_LENGTH) {
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
        this._setModelState("setRegion", [newStart, newEnd]);
    }

    /**
     * Zooms the view to the right level when the zoom slider is dragged.
     * 
     * @param {React.SyntheticEvent} event - the event that react fired when the zoom slider was changed
     */
    zoomSliderDragged(event) {
        let targetRegionSize = Math.exp(event.target.value);
        let proportion = targetRegionSize / this.state.viewRegion.getWidth();
        this._setModelState("zoom", [proportion]);
    }

    /**
     * @inheritdoc
     */
    render() {
        return (
            <div className="container-fluid">
                <nav className="navbar">
                    <div className="row">
                        <div className="col-sm">
                            <img src={eglogo} width="400px" alt="eg logo"/>
                        </div>
                       
                        <div className="col-md">
                            <TrackRegionController
                                selectedRegion={this.props.selectedRegion}
                                newRegionCallback={this.props.regionSelectedCallback}
                            />
                        </div>
                         <div className="col-sm">
                            <label>
                                Zoom:
                                <input
                                    type="range"
                                    min={Math.log(MIN_VIEW_LENGTH)}
                                    max={Math.log(this.state.viewRegion.getNavigationContext().getTotalBases())}
                                    step="any"
                                    value={Math.log(this.state.viewRegion.getWidth())}
                                    onChange={this.zoomSliderDragged}
                                />
                            </label>
                        </div>
                    </div>
                </nav>
                <MainPane
                    viewRegion={this.state.viewRegion}
                    selectedRegion={this.props.selectedRegion}
                    regionSelectedCallback={this.props.regionSelectedCallback}
                    dragCallback={this.setNewView}
                    gotoButtonCallback={this.setNewView}
                    zoomCallback={this.zoom}
                />
            </div>
        );
    }
}

export default GenomeNavigator;
