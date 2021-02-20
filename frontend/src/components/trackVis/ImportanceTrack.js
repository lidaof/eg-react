import React from 'react';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import Track from './commonComponents/Track';
import Smooth from 'array-smooth';
import HoverTooltipContext from './commonComponents/tooltip/HoverTooltipContext';
import Chromosomes from '../genomeNavigator/ImportanceChromosomes';
import GenomicCoordinates from './commonComponents/GenomicCoordinates';
import TrackLegend from './commonComponents/TrackLegend';
import withCurrentGenome from '../withCurrentGenome';

import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import { getGenomeConfig } from '../../model/genomes/allGenomes';
import { TrackModel } from '../../model/TrackModel';
import { NumericalDisplayModes } from '../../model/DisplayModes';
import { FeatureAggregator, DefaultAggregators } from '../../model/FeatureAggregator';
import { ScaleChoices } from '../../model/ScaleChoices';

const CHROMOSOMES_Y = 60;
const RULER_Y = 20;
const HEIGHT = 40;

/**
 * A ruler display.
 * 
 * @author Silas Hsu
 */


class RulerVisualizer extends React.PureComponent {
    static propTypes = Object.assign({}, Track.propsFromTrackContainer, 
    {
        genomeConfig: PropTypes.shape({cytobands: PropTypes.object}).isRequired, // Object with cytoband data
        data: PropTypes.array.isRequired, // PropTypes.arrayOf(Feature)        
        trackModel: PropTypes.instanceOf(TrackModel).isRequired,
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
        width: PropTypes.number.isRequired,
        unit: PropTypes.string, // Unit to display after the number in tooltips
        options: PropTypes.shape({
            aggregateMethod: PropTypes.oneOf(Object.values(DefaultAggregators.types)),
            displayMode: PropTypes.oneOf(Object.values(NumericalDisplayModes)).isRequired,
            height: PropTypes.number.isRequired, // Height of the track
            scaleType: PropTypes.any, // Unused for now
            scaleRange: PropTypes.array, // Unused for now
            color: PropTypes.string, // Color to draw bars, if using the default getBarElement            
        }).isRequired,
        xToValue: PropTypes.array.isRequired,   
        drawHeights: PropTypes.array.isRequired,
        zeroLine: PropTypes.number.isRequired
    });

    constructor(props) {        
        super(props);        
        this.renderTooltip = this.renderTooltip.bind(this);        
    }

        /**
     * Renders the default tooltip that is displayed on hover.
     * 
     * @param {number} relativeX - x coordinate of hover relative to the visualizer
     * @param {number} value - 
     * @return {JSX.Element} tooltip to render
     */
    renderTooltip(relativeX) {
        const {trackModel, viewRegion, width, unit, xToValue} = this.props;
        const value = xToValue[Math.round(relativeX)];        
        const stringValue = typeof value === "number" && !Number.isNaN(value) ? value.toFixed(2) : '(no data)';        
        return (
        <div>
            <div>
                <span className="Tooltip-major-text" style={{marginRight: 3}}>
                {this.hasReverse && "Forward: "} {stringValue}</span>
                {unit && <span className="Tooltip-minor-text">{unit}</span>}
            </div>
            <div className="Tooltip-minor-text" >
                <GenomicCoordinates viewRegion={viewRegion} width={width} x={relativeX} />
            </div>
            <div className="Tooltip-minor-text" >{trackModel.getDisplayLabel()}</div>
        </div>
        );
    }

    render() {
        console.debug("Well hello");
        const {data, trackModel, viewRegion, width, options, xToValue, zeroLine, drawHeights} = this.props;
        const {height, color, color2, aggregateMethod, colorAboveMax, color2BelowMin, smooth} = options;

        const genomeConfig = getGenomeConfig(trackModel.getMetadata('genome')) ||  this.props.genomeConfig;
        console.debug(genomeConfig);
        return (
        <HoverTooltipContext tooltipRelativeY={height} getTooltipContents={this.renderTooltip} >
            {/* display: block prevents svg from taking extra bottom space */ }
            <svg width={width} height={height} style={{display: "block"}} >
                <Chromosomes
                    genomeConfig={genomeConfig}
                    viewRegion={viewRegion}
                    width={width}
                    labelOffset={CHROMOSOMES_Y}
                    hideChromName={true}
                    xToValue={xToValue}
                    drawHeights={drawHeights}
                    zeroLine={zeroLine}
                    height={height}
                />                
            </svg>
        </HoverTooltipContext>
        );
    }
}

const RulerVisualizerWithGenome = withCurrentGenome(RulerVisualizer);

function RulerTrack(props, xToValue, drawHeights, zeroLine, legend) {
    return <Track
        {...props}
        // legend={<TrackLegend height={HEIGHT} trackModel={props.trackModel} trackViewRegion={props.viewRegion}
        //     selectedRegion={props.selectedRegion}
        //     trackWidth={props.width} />}
        legend={legend}
        visualizer={<RulerVisualizerWithGenome data={props.data} viewRegion={props.viewRegion} width={props.width} trackModel={props.trackModel} options={props.options} xToValue={xToValue} drawHeights={drawHeights} zeroLine={zeroLine}/>}
    />;
}

export default RulerTrack;
