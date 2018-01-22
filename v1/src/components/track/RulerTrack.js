import React from 'react';

import { TRACK_PROP_TYPES } from './Track'
import TrackLegend from './TrackLegend';

import ChromosomeDesigner from '../../art/ChromosomeDesigner';
import RulerDesigner from '../../art/RulerDesigner';
import SvgDesignRenderer from '../SvgDesignRenderer';

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

        const rulerDesign = new RulerDesigner(visibleRegion, this.props.width).design();
        const chromosomeDesign = new ChromosomeDesigner(visibleRegion, this.props.width, 60).design();
        
        return (
        <div style={{display: "flex", borderBottom: "1px solid grey", overflow: "hidden"}}>
            <TrackLegend height={HEIGHT} trackModel={this.props.trackModel} />
            <svg width={this.props.width} height={HEIGHT} >
                <SvgDesignRenderer design={chromosomeDesign} />
                <SvgDesignRenderer design={rulerDesign} y={20} />
            </svg>
        </div>
        );
    }
}

export default RulerTrack;
