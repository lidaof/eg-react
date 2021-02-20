import React from 'react';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';

import { Sequence } from '../ImportanceSequence';

import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import LinearDrawingModel from '../../model/LinearDrawingModel';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';
import NavigationContext from '../../model/NavigationContext';
import { FeaturePlacer } from '../../model/FeaturePlacer';
import TwoBitSource from '../../dataSources/TwoBitSource';
import { TranslatableG } from '../TranslatableG';

const HEIGHT = 15;
const TOP_PADDING = 5;
const DEFAULT_LABEL_OFFSET = 70;
const FEATURE_LABEL_SIZES = [16, 12, 8];

const CYTOBAND_COLORS = {
    'gneg': {bandColor: "white", textColor: "rgb(0,0,0)"},
    'gpos': {bandColor: "rgb(180,180,180)", textColor: "rgb(0,0,0)"},
    'gpos25': {bandColor: "rgb(180,180,180)", textColor: "rgb(0,0,0)"},
    'gpos50': {bandColor: "rgb(120,120,120)", textColor: "rgb(255,255,255)"},
    'gpos75': {bandColor: "rgb(60,60,60)", textColor: "rgb(255,255,255)"},
    'gpos100': {bandColor: "rgb(0,0,0)", textColor: "rgb(255,255,255)"},
    'gvar': {bandColor: "rgb(0,0,0)", textColor: "rgb(255,255,255)"},
    'stalk': {bandColor: "rgb(180,180,180)", textColor: "rgb(0,0,0)"},
    'gpos33': {bandColor: "rgb(142,142,142)", textColor: "rgb(255,255,255)"},
    'gpos66': {bandColor: "rgb(57,57,57)", textColor: "rgb(255,255,255)"},
    'acen': {bandColor: "rgb(141,64,52)", textColor: "rgb(255,255,255)"}, // Centromere
};
const CYTOBAND_LABEL_SIZE = 10;

/**
 * Draws rectangles that represent features in a navigation context, and labels for the features.  Called "Chromosomes"
 * because at first, NavigationContexts only held chromosomes as features.
 * 
 * @author Silas Hsu and Daofeng Li
 */
class Chromosomes extends React.PureComponent {
    static propTypes = {
        genomeConfig: PropTypes.shape({cytobands: PropTypes.object}).isRequired, // Object with cytoband data
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // Region to visualize
        width: PropTypes.number.isRequired, // Width with which to draw
        labelOffset: PropTypes.number, // Y offset of feature labels
        x: PropTypes.number, // X offset of the entire graphic
        y: PropTypes.number, // Y offset of the entire graphic
        xToValue: PropTypes.array.isRequired,
        drawHeights: PropTypes.array.isRequired,
        zeroLine: PropTypes.number.isRequired,
        height: PropTypes.number
    };

    constructor(props){
        super(props);
        this.state = {
            sequenceData: []
        };
        this.twoBitSource = props.genomeConfig.twoBitURL ? new TwoBitSource(props.genomeConfig.twoBitURL) : null;
        this.fetchSequence = _.throttle(this.fetchSequence, 500);
        this.fetchSequence(props);

        this.featurePlacer = new FeaturePlacer();
        this.featurePlacer.placeFeatures = memoizeOne(this.featurePlacer.placeFeatures);
    }

    /**
     * Fetches sequence data for the view region stored in `props`, if zoomed in enough.
     * 
     * @param {Object} props - props as specified by React
     */
    async fetchSequence(props) {
        if (!this.twoBitSource) {
            return;
        }

        const drawModel = new LinearDrawingModel(props.viewRegion, props.width);
        if (drawModel.basesToXWidth(1) > Sequence.MIN_X_WIDTH_PER_BASE) {
            try {                
                const sequence = await this.twoBitSource.getData(props.viewRegion);
                if (this.props.viewRegion === props.viewRegion) { // Check that when the data comes in, we still want it
                    this.setState({sequenceData: sequence});
                }
            } catch (error) {
                console.error(error);
            }
        }
    }

    /**
     * If zoomed in enough, fetches sequence.
     * 
     * @param {Object} nextProps - props as specified by React
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.viewRegion !== nextProps.viewRegion) {
            const drawModel = new LinearDrawingModel(nextProps.viewRegion, nextProps.width);            
            if (drawModel.basesToXWidth(1) > Sequence.MIN_X_WIDTH_PER_BASE) {                
                this.fetchSequence(nextProps);
            }
        }
    }

    /**
     * Tries to find a label size that fits within `maxWidth`.  Returns `undefined` if it cannot find one.
     * 
     * @param {string} label - the label contents
     * @param {number} maxWidth - max requested width of the label
     * @return {number | undefined} an appropriate width for the label, or undefined if there is none
     */
    getSizeForFeatureLabel(label, maxWidth) {
        return FEATURE_LABEL_SIZES.find(size => (label.length * size * 0.6) < maxWidth);
    }

    renderSequences() {
        console.debug("TRYNA RENDER SEQ");
        const {viewRegion, width, height} = this.props;
        const placedSequences = this.featurePlacer.placeFeatures(this.state.sequenceData, viewRegion, width);        
        return placedSequences.map((placement, i) => {
            const {feature, visiblePart, xSpan, isReverse} = placement;
            const {relativeStart, relativeEnd} = visiblePart;
            return <Sequence
                key={i}
                sequence={feature.sequence.substring(relativeStart, relativeEnd)}
                xSpan={xSpan}
                y={0}
                isReverseComplement={isReverse}
                xToValue={this.props.xToValue}
                drawHeights={this.props.drawHeights}
                zeroLine={this.props.zeroLine}
                height={height}
            />;
        });
    }

    /**
     * Redraws all the feature boxes
     * 
     * @override
     */
    render() {
        const {viewRegion, width, labelOffset, hideChromName} = this.props;
        const drawModel = new LinearDrawingModel(viewRegion, width);

        return <TranslatableG x={this.props.x} y={this.props.y}>
            {drawModel.basesToXWidth(1) > Sequence.MIN_X_WIDTH_PER_BASE && this.renderSequences()}
        </TranslatableG>;
    }
}

export default Chromosomes;