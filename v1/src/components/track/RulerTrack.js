import React from 'react';

import { TRACK_PROP_TYPES } from './Track'
import TrackLegend from './TrackLegend';

import SvgContainer from '../SvgContainer';
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
        const drawModel = new LinearDrawingModel(this.props.viewRegion, this.props.width);
        const visibleRegion = this.props.viewRegion.clone().pan(drawModel.xWidthToBases(-this.props.xOffset));
        
        return (
        <div style={{display: "flex", borderBottom: "1px solid grey", overflow: "hidden"}}>
            <TrackLegend height={HEIGHT} trackModel={this.props.trackModel} />
            <SvgContainer
                width={this.props.width}
                height={HEIGHT}
                displayedRegion={visibleRegion}
            >
                <Chromosomes y={0} displayedRegion={visibleRegion} labelOffset={60}/>
                <Ruler y={20} displayedRegion={visibleRegion} />
            </SvgContainer>
        </div>
        );
    }
}

export default RulerTrack;
