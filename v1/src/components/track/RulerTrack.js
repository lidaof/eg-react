import React from 'react';
import { VISUALIZER_PROP_TYPES } from './Track';
import GenomicCoordinates from './GenomicCoordinates';
import Chromosomes from '../genomeNavigator/Chromosomes';
import Ruler from '../genomeNavigator/Ruler';
import { getRelativeCoordinates } from '../../util';
import Tooltip from './Tooltip';

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
        const x = getRelativeCoordinates(event).x;
        const tooltip = (
            <Tooltip relativeTo={event.currentTarget} x={x} y={RULER_Y} onClose={this.closeTooltip} ignoreMouse={true} >
                <GenomicCoordinates viewRegion={viewRegion} width={width} x={x} />
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
        <React.Fragment>
            <svg
                width={width}
                height={HEIGHT}
                style={{display: "block"}} // display: block to prevent svg from taking extra bottom space
                onMouseMove={this.showTooltip}
                onMouseLeave={this.closeTooltip}
                onMouseUp={this.closeTooltip}
            >
                <Chromosomes viewRegion={viewRegion} width={width} labelOffset={CHROMOSOMES_Y} />
                <Ruler viewRegion={viewRegion} width={width} y={RULER_Y} />
            </svg>
            {this.state.tooltip}
        </React.Fragment>
        );
    } 
}

const RulerTrack = {
    visualizer: RulerVisualizer
};

export default RulerTrack;
