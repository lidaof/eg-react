import React from 'react';

import { VISUALIZER_PROP_TYPES } from './Track';
import HoverTooltipContext from './HoverTooltipContext';
import Chromosomes from '../genomeNavigator/Chromosomes';
import Ruler from '../genomeNavigator/Ruler';
import GenomicCoordinates from './GenomicCoordinates';
import TrackLegend from './TrackLegend';

const CHROMOSOMES_Y = 60;
const RULER_Y = 20;
const HEIGHT = 65;

/**
 * A ruler.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
class RulerVisualizer extends React.Component {
    static propTypes = VISUALIZER_PROP_TYPES;

    constructor(props) {
        super(props);
        this.getTooltipContents = this.getTooltipContents.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.viewRegion !== nextProps.viewRegion || this.props.width !== nextProps.width;
    }

    getTooltipContents(relativeX) {
        const {viewRegion, width} = this.props;
        return <GenomicCoordinates viewRegion={viewRegion} width={width} x={relativeX} />;
    }

    /**
     * @inheritdoc
     */
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

function RulerLegend(props) {
    return <TrackLegend height={HEIGHT} {...props} />;
}

const RulerTrack = {
    visualizer: RulerVisualizer,
    legend: RulerLegend
};

export default RulerTrack;
