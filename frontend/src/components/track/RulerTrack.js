import React from 'react';
import PropTypes from 'prop-types';

import NewTrack from './NewTrack';
import HoverTooltipContext from './commonComponents/HoverTooltipContext';
import Chromosomes from '../genomeNavigator/Chromosomes';
import Ruler from '../genomeNavigator/Ruler';
import GenomicCoordinates from './commonComponents/GenomicCoordinates';
import TrackLegend from './commonComponents/TrackLegend';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';

const CHROMOSOMES_Y = 60;
const RULER_Y = 20;
const HEIGHT = 65;

/**
 * A ruler display.
 * 
 * @author Silas Hsu
 */
class RulerVisualizer extends React.Component {
    static propTypes = {
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
        width: PropTypes.number.isRequired,
    };

    constructor(props) {
        super(props);
        this.getTooltipContents = this.getTooltipContents.bind(this);
    }

    /**
     * Updates only on changes to view region or width.
     * 
     * @param {Object} nextProps - props as specified by React
     * @return {boolean} whether this component should rerender
     * @override
     */
    shouldComponentUpdate(nextProps, nextState) {
        return this.props.viewRegion !== nextProps.viewRegion || this.props.width !== nextProps.width;
    }

    getTooltipContents(relativeX) {
        const {viewRegion, width} = this.props;
        return <GenomicCoordinates viewRegion={viewRegion} width={width} x={relativeX} />;
    }

    render() {
        const {viewRegion, width} = this.props;
        return (
        <HoverTooltipContext tooltipRelativeY={RULER_Y} getTooltipContents={this.getTooltipContents} >
            {/* display: block prevents svg from taking extra bottom space */ }
            <svg width={width} height={HEIGHT} style={{display: "block"}} >
                <Chromosomes viewRegion={viewRegion} width={width} labelOffset={CHROMOSOMES_Y} />
                <Ruler viewRegion={viewRegion} width={width} y={RULER_Y} />
            </svg>
        </HoverTooltipContext>
        );
    }
}


function RulerTrack(props) {
    return <NewTrack
        {...props}
        legend={<TrackLegend height={HEIGHT} trackModel={props.trackModel} />}
        visualizer={<RulerVisualizer viewRegion={props.viewRegion} width={props.width} />}
    />;
}

const RulerTrackConfig = {
    component: RulerTrack
};

export default RulerTrackConfig;
