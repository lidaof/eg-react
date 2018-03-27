import React from 'react';
import PropTypes from 'prop-types';
import withCurrentGenome from '../withCurrentGenome';

import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import LinearDrawingModel from '../../model/LinearDrawingModel';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';

const HEIGHT = 15;
const TOP_PADDING = 5;
const DEFAULT_LABEL_OFFSET = 70;
const FEATURE_LABEL_SIZES = [16, 12, 8];

// const CENTROMERE_COLOR = "rgb(141,64,52)";
const CYTOBAND_COLORS = {
    'gneg': {bandColor: "rgb(255,255,255)", textColor: "rgb(0,0,0)"},
    'gpos25': {bandColor: "rgb(180,180,180)", textColor: "rgb(0,0,0)"},
    'gpos50': {bandColor: "rgb(120,120,120)", textColor: "rgb(255,255,255)"},
    'gpos75': {bandColor: "rgb(60,60,60)", textColor: "rgb(255,255,255)"},
    'gpos100': {bandColor: "rgb(0,0,0)", textColor: "rgb(255,255,255)"},
    'gvar': {bandColor: "rgb(0,0,0)", textColor: "rgb(255,255,255)"},
    'stalk': {bandColor: "rgb(180,180,180)", textColor: "rgb(0,0,0)"},
    'gpos33': {bandColor: "rgb(142,142,142)", textColor: "rgb(255,255,255)"},
    'gpos66': {bandColor: "rgb(57,57,57)", textColor: "rgb(255,255,255)"},
    'acen': {bandColor: "rgb(180,180,180)", textColor: "rgb(0,0,0)"},
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
        y: PropTypes.number // Y offset of the entire graphic
    };

    /**
     * Gets the cytoband elements to draw within a feature interval.
     * 
     * @param {FeatureInterval} interval - FeatureInterval containing genetic locus for which to draw cytobands
     * @param {LinearDrawingModel} drawModel - draw model to use
     * @return {JSX.Element[]} cytoband elements
     */
    renderCytobandsInFeatureInterval(interval, drawModel) {
        const {viewRegion, genomeConfig} = this.props;

        const locus = interval.getGenomeCoordinates();
        const cytobandsForChr = genomeConfig.cytobands[locus.chr] || [];
        let children = [];
        for (let cytoband of cytobandsForChr) {
            const cytobandLocus = new ChromosomeInterval(cytoband.chrom, cytoband.chromStart, cytoband.chromEnd);
            if (!cytobandLocus.getOverlap(locus)) {
                continue;
            }

            // Abs interval of the cytoband in the navigation context
            const absInterval = viewRegion.getNavigationContext().convertGenomeIntervalToBases(
                cytobandLocus, interval.feature
            );
            const startX = Math.max(0, drawModel.baseToX(absInterval.start));
            const endX = Math.min(drawModel.baseToX(absInterval.end), drawModel.getDrawWidth());
            const drawWidth = endX - startX;
            const colors = CYTOBAND_COLORS[cytoband.gieStain];
            const name = cytoband.name;

            if (drawWidth >= 1) { // Cytoband rectangle
                children.push(<rect
                    key={name + startX + "-rect"}
                    x={startX}
                    y={TOP_PADDING}
                    width={drawWidth}
                    height={HEIGHT}
                    style={{fill: colors.bandColor}}
                />);
            }

            const estimatedLabelWidth = name.length * CYTOBAND_LABEL_SIZE;
            if (estimatedLabelWidth < drawWidth) { // Cytoband label, if it fits
                children.push(
                    <text
                        key={name + startX + "text"}
                        x={startX + drawWidth/2}
                        y={TOP_PADDING + HEIGHT/2 + 3}
                        style={{textAnchor: "middle", fill: colors.textColor, fontSize: CYTOBAND_LABEL_SIZE}}
                    >
                        {name}
                    </text>
                );
            }
        }

        return children;
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

    /**
     * Redraws all the feature boxes
     * 
     * @override
     */
    render() {
        const {viewRegion, width, labelOffset} = this.props;
        let children = [];
        const drawModel = new LinearDrawingModel(viewRegion, width);

        const intervals = viewRegion.getFeatureIntervals();
        let x = 0;
        for (let interval of intervals) {
            const drawWidth = drawModel.basesToXWidth(interval.getLength());

            children.push(<rect // Box for feature
                key={"rect" + x}
                x={x}
                y={TOP_PADDING}
                width={drawWidth}
                height={HEIGHT}
                style={{stroke: "#000", strokeWidth: 2, fill: "#fff"}}
                opacity="0.5"
            />);

            children.push(...this.renderCytobandsInFeatureInterval(interval, drawModel)); // Cytobands

            if (x > 0) { // Thick line at boundaries of each feature, except the first one
                children.push(<line
                    key={"line" + x}
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={TOP_PADDING * 2 + HEIGHT}
                    stroke={"#000"}
                    strokeWidth={4}
                />);
            }

            const labelSize = this.getSizeForFeatureLabel(interval.getName(), drawWidth); 
            if (labelSize) { // Label for feature, if it fits
                children.push(
                    <text
                        key={"text" + x}
                        x={x + drawWidth/2}
                        y={labelOffset || DEFAULT_LABEL_OFFSET}
                        style={{textAnchor: "middle", fontWeight: "bold", fontSize: labelSize}}
                    >
                        {interval.getName()}
                    </text>
                );
            }

            x += drawWidth;
        }

        return <svg x={this.props.x} y={this.props.y}>{children}</svg>;
    }
}

export default withCurrentGenome(Chromosomes);
