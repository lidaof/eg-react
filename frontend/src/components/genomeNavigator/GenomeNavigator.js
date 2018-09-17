import React from 'react';
import PropTypes from 'prop-types';
import { MIN_VIEW_REGION_SIZE } from '../../AppState';
import MainPane from './MainPane';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';

//import './GenomeNavigator.css';

/**
 * A navigator that allows users to scroll around the genome and select what region for tracks to display.
 * 
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
         *         `newStart`: the nav context coordinate of the start of the selected interval
         *         `newEnd`: the nav context coordinate of the end of the selected interval
         */
        onRegionSelected: PropTypes.func
    };

    static defaultProps = {
        onRegionSelected: () => undefined
    };

    /**
     * Binds functions, and also forks that view region that was passed via props.
     */
    constructor(props) {
        super(props);
        this.state = {
            viewRegion: this._setInitialView(props.selectedRegion),
        };

        this.zoom = this.zoom.bind(this);
        this.setNewView = this.setNewView.bind(this);
        this.zoomSliderDragged = this.zoomSliderDragged.bind(this);
    }

    /**
     * Sets the default region for MainPane to cover whole chromosomes/features that are in `selectedRegion`
     * 
     * @param {DisplayedRegionModel} selectedRegion - the currently selected region
     * @return {DisplayedRegionModel} the default view region for the genome navigator
     */
    _setInitialView(selectedRegion) {
        const navContext = selectedRegion.getNavigationContext();
        const features = selectedRegion.getFeatureSegments().map(segment => segment.feature);

        const firstFeature = features[0];
        const lastFeature = features[features.length - 1];

        const startBase = navContext.getFeatureStart(firstFeature);
        const endBase = navContext.getFeatureStart(lastFeature) + lastFeature.getLength();
        return new DisplayedRegionModel(navContext, startBase, endBase);
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
        if (this.props.selectedRegion.getGenomeIntervals()[0].chr !== 
                nextProps.selectedRegion.getGenomeIntervals()[0].chr) {
            this.setState( {
                viewRegion: this._setInitialView(nextProps.selectedRegion)
            });
        }
    }

    /**
     * Copies this.state.viewRegion, mutates it by calling `methodName` with `args`, and then calls this.setState().
     * 
     * @param {string} methodName - the method to call on the model
     * @param {any[]} args - arguments to provide to the method
     */
    _setModelState(methodName, args) {
        let regionCopy = this.state.viewRegion.clone();
        regionCopy[methodName].apply(regionCopy, args);
        if (regionCopy.getWidth() < MIN_VIEW_REGION_SIZE) {
            return;
        }
        this.setState({viewRegion: regionCopy});
    }

    /**
     * Wrapper for calling zoom() on the view model.
     * 
     * @param {number} amount - amount to zoom
     * @param {number} [focusPoint] - focal point of the zoom
     * @see DisplayedRegionModel#zoom
     */
    zoom(amount, focusPoint) {
        this._setModelState("zoom", [amount, focusPoint]);
    }

    /**
     * Wrapper for calling setRegion() on the view model
     * 
     * @param {number} newStart - start nav context coordinate
     * @param {number} newEnd - end nav context coordinate
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
            <div style={{margin: "5px"}}>
                <MainPane
                    viewRegion={this.state.viewRegion}
                    selectedRegion={this.props.selectedRegion}
                    onRegionSelected={this.props.onRegionSelected}
                    onNewViewRequested={this.setNewView}
                    onZoom={this.zoom}
                />
            </div>
        );
    }
}

export default GenomeNavigator;
