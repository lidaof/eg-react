import React from 'react';

import { VISUALIZER_PROP_TYPES } from './Track';
import Chromosomes from '../genomeNavigator/Chromosomes';
import Ruler from '../genomeNavigator/Ruler';
import Tooltip from './Tooltip';
import GenomicCoordinates from './GenomicCoordinates';
import TrackLegend from './TrackLegend';

import { getRelativeCoordinates, getPageCoordinates } from '../../util';

const CHROMOSOMES_Y = 60;
const RULER_Y = 20;
const HEIGHT = 65;

/**
 * A ruler.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
class RulerVisualizer extends React.PureComponent {
    static propTypes = VISUALIZER_PROP_TYPES;

    constructor(props) {
        super(props);
        this.state = {
            tooltip: null
        };
        this.showTooltip = this.showTooltip.bind(this);
        this.closeTooltip = this.closeTooltip.bind(this);
    }

    /**
     * Sets state to show a tooltip displaying genomic coordinates.
     * 
     * @param {MouseEvent} event - mouse event for positioning hints
     */
    showTooltip(event) {
        const {viewRegion, width} = this.props;
        const relativeX = getRelativeCoordinates(event).x;
        const pageY = getPageCoordinates(event.currentTarget, 0, RULER_Y).y;
        const tooltip = (
            <Tooltip pageX={event.pageX} pageY={pageY} onClose={this.closeTooltip} ignoreMouse={true} >
                <GenomicCoordinates viewRegion={viewRegion} width={width} x={relativeX} />
            </Tooltip>
        );
        this.setState({tooltip: tooltip});
    }

    /**
     * Sets state to stop showing any tooltips.
     */
    closeTooltip(event) {
        this.setState({tooltip: null});
    }

    /**
     * @inheritdoc
     */
    render() {
        const {width, viewRegion} = this.props;
        return (
        <div onMouseMove={this.showTooltip} onMouseLeave={this.closeTooltip}>
            {/* display: block prevents svg from taking extra bottom space */ }
            <svg width={width} height={HEIGHT} style={{display: "block"}} >
                <Chromosomes viewRegion={viewRegion} width={width} labelOffset={CHROMOSOMES_Y} />
                <Ruler viewRegion={viewRegion} width={width} y={RULER_Y} />
            </svg>
            {this.state.tooltip}
        </div>
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
