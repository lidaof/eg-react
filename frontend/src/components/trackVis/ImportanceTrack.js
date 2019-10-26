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

export const DEFAULT_OPTIONS = {
    aggregateMethod: DefaultAggregators.types.MEAN,
    displayMode: NumericalDisplayModes.AUTO,
    height: 40,
    color: "blue",
    colorAboveMax: "red",
    color2: "darkorange",
    color2BelowMin: "darkgreen",
    yScale: ScaleChoices.AUTO,
    yMax: 10,
    yMin: 0,
    smooth: 0,
};

const AUTO_HEATMAP_THRESHOLD = 21; // If pixel height is less than this, automatically use heatmap

class RulerVisualizer extends React.PureComponent {
    static propTypes = Object.assign({}, Track.propsFromTrackContainer, 
    {
        data: PropTypes.array.isRequired, // PropTypes.arrayOf(Feature)
        genomeConfig: PropTypes.object.isRequired,
        trackModel: PropTypes.instanceOf(TrackModel).isRequired,
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
        width: PropTypes.number.isRequired,
        options: PropTypes.shape({
            aggregateMethod: PropTypes.oneOf(Object.values(DefaultAggregators.types)),
            displayMode: PropTypes.oneOf(Object.values(NumericalDisplayModes)).isRequired,
            height: PropTypes.number.isRequired, // Height of the track
            scaleType: PropTypes.any, // Unused for now
            scaleRange: PropTypes.array, // Unused for now
            color: PropTypes.string, // Color to draw bars, if using the default getBarElement
        }).isRequired,
    });

    constructor(props) {
        super(props);
        console.debug("HELLO");
        console.debug(props);

        this.aggregateFeatures = memoizeOne(this.aggregateFeatures);
        this.computeScales = memoizeOne(this.computeScales);
        
        this.xToValue = null;
        this.xToValue2 = null;
        this.getTooltipContents = this.getTooltipContents.bind(this);
    }

    aggregateFeatures(data, viewRegion, width, aggregatorId) {
        const aggregator = new FeatureAggregator();
        const xToFeatures = aggregator.makeXMap(data, viewRegion, width);
        return xToFeatures.map( DefaultAggregators.fromId(aggregatorId) );
    }

    getEffectiveDisplayMode() {
        const {displayMode, height} = this.props.options;
        if (displayMode === NumericalDisplayModes.AUTO) {
            return height < AUTO_HEATMAP_THRESHOLD ? NumericalDisplayModes.HEATMAP : NumericalDisplayModes.BAR;
        } else {
            return displayMode;
        }
    }


    getTooltipContents(relativeX) {
        const {viewRegion, width} = this.props;
        return <GenomicCoordinates viewRegion={viewRegion} width={width} x={relativeX} />;
    }

    render() {
        const {data, trackModel, viewRegion, width, options} = this.props;
        const {height, color, color2, aggregateMethod, colorAboveMax, color2BelowMin, smooth} = options;

        const genomeConfig = getGenomeConfig(trackModel.getMetadata('genome')) || this.props.genomeConfig;

        const dataForward = data.filter(feature => feature.value === undefined || feature.value >= 0); // bed track to density mode
        const dataReverse = data.filter(feature => feature.value < 0);
        let xToValue2BeforeSmooth;
        if (dataReverse.length > 0) {
            this.hasReverse = true;
            xToValue2BeforeSmooth = this.aggregateFeatures(dataReverse, viewRegion, width, aggregateMethod);
        } else {
            xToValue2BeforeSmooth = [];
        }
        this.xToValue2 = smooth === 0 ? xToValue2BeforeSmooth: Smooth(xToValue2BeforeSmooth, smooth);
        const isDrawingBars = this.getEffectiveDisplayMode() === NumericalDisplayModes.BAR; // As opposed to heatmap
        const xToValueBeforeSmooth = dataForward.length > 0 ? this.aggregateFeatures(dataForward, viewRegion, width, aggregateMethod) : [];
        this.xToValue = smooth === 0 ? xToValueBeforeSmooth: Smooth(xToValueBeforeSmooth, smooth);

        return (
        <HoverTooltipContext tooltipRelativeY={RULER_Y} getTooltipContents={this.getTooltipContents} >
            {/* display: block prevents svg from taking extra bottom space */ }
            <svg width={width} height={HEIGHT} style={{display: "block"}} >
                <Chromosomes
                    genomeConfig={genomeConfig}
                    viewRegion={viewRegion}
                    width={width}
                    labelOffset={CHROMOSOMES_Y}
                    hideChromName={true}
                    xToValue={this.xToValue}
                />                
            </svg>
        </HoverTooltipContext>
        );
    }
}

const Visualizer = withCurrentGenome(RulerVisualizer);

function RulerTrack(props) {
    return <Track
        {...props}
        legend={<TrackLegend height={HEIGHT} trackModel={props.trackModel} trackViewRegion={props.viewRegion}
            selectedRegion={props.selectedRegion}
            trackWidth={props.width} />}
        visualizer={<Visualizer data={props.data} viewRegion={props.viewRegion} width={props.width} trackModel={props.trackModel} options={props.options} />}
    />;
}

export default RulerTrack;
