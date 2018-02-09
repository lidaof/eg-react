import React from 'react';
import TrackLegend from './TrackLegend';
import Chromosomes from '../genomeNavigator/Chromosomes';
import Ruler from '../genomeNavigator/Ruler';

const HEIGHT = 65;

/**
 * A ruler.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
function RulerVisualizer(props) {
    return (
    // display: block to prevent svg from taking extra bottom space
    <svg width={props.width} height={HEIGHT} style={{display: "block"}} >
        <Chromosomes viewRegion={props.viewRegion} width={props.width} labelOffset={60} />
        <Ruler viewRegion={props.viewRegion} width={props.width} y={20} />
    </svg>
    );
}

const RulerTrack = {
    visualizer: RulerVisualizer
};

export default RulerTrack;
