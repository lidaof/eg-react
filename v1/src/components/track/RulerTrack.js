import React from 'react';

import { TRACK_PROP_TYPES } from './Track'
import TrackLegend from './TrackLegend';
import Chromosomes from '../genomeNavigator/Chromosomes';
import Ruler from '../genomeNavigator/Ruler';

import LinearDrawingModel from '../../model/LinearDrawingModel';

const HEIGHT = 65;

class RulerTrack extends React.Component {
    static propTypes = TRACK_PROP_TYPES;

    /**
     * When the view region changes, pretend that the Ruler got new data for the region.
     * 
     * @param {Object} prevProps 
     */
    componentDidUpdate(prevProps) {
        if (prevProps.viewRegion !== this.props.viewRegion && this.props.onNewData) {
            this.props.onNewData();
        }
    }

    render() {
        const panModel = new LinearDrawingModel(this.props.viewRegion, this.props.width);
        const visibleRegion = this.props.viewRegion.clone().pan(panModel.xWidthToBases(-this.props.xOffset));
        
        return (
        <div style={{display: "flex", borderBottom: "1px solid grey", overflow: "hidden"}}>
            <TrackLegend height={HEIGHT} trackModel={this.props.trackModel} />
            <svg width={this.props.width} height={HEIGHT} >
                <Chromosomes viewRegion={visibleRegion} width={this.props.width} labelOffset={60} />
                <Ruler viewRegion={visibleRegion} width={this.props.width} y={20} />
            </svg>
        </div>
        );
    }
}

export default RulerTrack;
