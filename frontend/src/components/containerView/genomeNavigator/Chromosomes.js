import React from "react";
import PropTypes from "prop-types";
import memoizeOne from "memoize-one";
import _ from "lodash";

import { Sequence } from "../Sequence";

import DisplayedRegionModel from "../../model/DisplayedRegionModel";
import LinearDrawingModel from "../../model/LinearDrawingModel";
import ChromosomeInterval from "../../model/interval/ChromosomeInterval";
import NavigationContext from "../../model/NavigationContext";
import { FeaturePlacer } from "../../model/FeaturePlacer";
import TwoBitSource from "../../dataSources/TwoBitSource";
import { TranslatableG } from "../TranslatableG";
import { SequenceData } from "../../model/SequenceData";

const HEIGHT = 15;
const TOP_PADDING = 5;
const DEFAULT_LABEL_OFFSET = 70;
const FEATURE_LABEL_SIZES = [16, 12, 8];

const CYTOBAND_COLORS = {
    gneg: { bandColor: "white", textColor: "rgb(0,0,0)" },
    gpos: { bandColor: "rgb(180,180,180)", textColor: "rgb(0,0,0)" },
    gpos25: { bandColor: "rgb(180,180,180)", textColor: "rgb(0,0,0)" },
    gpos50: { bandColor: "rgb(120,120,120)", textColor: "rgb(255,255,255)" },
    gpos75: { bandColor: "rgb(60,60,60)", textColor: "rgb(255,255,255)" },
    gpos100: { bandColor: "rgb(0,0,0)", textColor: "rgb(255,255,255)" },
    gvar: { bandColor: "rgb(0,0,0)", textColor: "rgb(255,255,255)" },
    stalk: { bandColor: "rgb(180,180,180)", textColor: "rgb(0,0,0)" },
    gpos33: { bandColor: "rgb(142,142,142)", textColor: "rgb(255,255,255)" },
    gpos66: { bandColor: "rgb(57,57,57)", textColor: "rgb(255,255,255)" },
    acen: { bandColor: "rgb(141,64,52)", textColor: "rgb(255,255,255)" }, // Centromere
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
        genomeConfig: PropTypes.shape({ cytobands: PropTypes.object }).isRequired, // Object with cytoband data
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // Region to visualize
        width: PropTypes.number.isRequired, // Width with which to draw
        labelOffset: PropTypes.number, // Y offset of feature labels
        x: PropTypes.number, // X offset of the entire graphic
        y: PropTypes.number, // Y offset of the entire graphic
        drawHeights: PropTypes.array,
        zeroLine: PropTypes.number,
        height: PropTypes.number,
        hideCytoband: PropTypes.bool,
        minXwidthPerBase: PropTypes.number,
    };

    static defaultProps = {
        minXwidthPerBase: 1,
        hideCytoband: false,
    };

    constructor(props) {
        super(props);
        this.state = {
            sequenceData: [],
        };
        this.twoBitSource = props.genomeConfig.twoBitURL ? new TwoBitSource(props.genomeConfig.twoBitURL) : null;
        this.fastaSeq = props.genomeConfig.fastaSeq ? props.genomeConfig.fastaSeq : "";
        this.fetchSequence = _.throttle(this.fetchSequence, 500);
        // this.fetchSequence(props);

        this.featurePlacer = new FeaturePlacer();
        this.featurePlacer.placeFeatures = memoizeOne(this.featurePlacer.placeFeatures);
    }

    componentDidMount() {
        this.fetchSequence(this.props);
    }
    /**
     * Fetches sequence data for the view region stored in `props`, if zoomed in enough.
     *
     * @param {Object} props - props as specified by React
     */
    fetchSequence = async (props) => {
        if (!(this.twoBitSource || this.fastaSeq.length)) {
            return;
        }

        const drawModel = new LinearDrawingModel(props.viewRegion, props.width);
        if (drawModel.basesToXWidth(1) > props.minXwidthPerBase) {
            let sequence = [];
            if (this.fastaSeq.length) {
                const interval = props.viewRegion.getContextCoordinates();
                const seq = this.fastaSeq.slice(interval.start, interval.end);
                sequence = props.viewRegion.getGenomeIntervals().map((locus) => new SequenceData(locus, seq));
                this.setState({ sequenceData: sequence });
            } else {
                try {
                    sequence = await this.twoBitSource.getData(props.viewRegion);
                    if (this.props.viewRegion === props.viewRegion) {
                        // Check that when the data comes in, we still want it
                        this.setState({ sequenceData: sequence });
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        }
    };

    /**
     * If zoomed in enough, fetches sequence.
     *
     * @param {Object} nextProps - props as specified by React
     */
    // UNSAFE_componentWillReceiveProps(nextProps) {
    //     if (this.props.viewRegion !== nextProps.viewRegion) {
    //         const drawModel = new LinearDrawingModel(nextProps.viewRegion, nextProps.width);
    //         if (drawModel.basesToXWidth(1) > nextProps.minXwidthPerBase) {
    //             this.fetchSequence(nextProps);
    //         }
    //     }
    // }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.viewRegion !== prevProps.viewRegion) {
            const drawModel = new LinearDrawingModel(this.props.viewRegion, this.props.width);
            if (drawModel.basesToXWidth(1) > this.props.minXwidthPerBase) {
                this.fetchSequence(this.props);
            }
        }
    }

    /**
     *
     * @param {*} cytoband
     * @param {ChromosomeInterval} cytobandLocus
     * @param {LinearDrawingModel} drawModel
     */
    renderOneCytoband(cytoband, cytobandLocus, drawModel) {
        const contextIntervals = this.props.viewRegion
            .getNavigationContext()
            .convertGenomeIntervalToBases(cytobandLocus);
        const children = [];
        for (const contextInterval of contextIntervals) {
            const startX = Math.max(0, drawModel.baseToX(contextInterval.start));
            const endX = Math.min(drawModel.baseToX(contextInterval.end), drawModel.getDrawWidth());
            const drawWidth = endX - startX;
            const colors = CYTOBAND_COLORS[cytoband.gieStain];
            const name = cytoband.name;
            if (drawWidth < this.props.minXwidthPerBase) {
                continue;
            }

            if (colors.bandColor !== "white") {
                // Cytoband rectangle
                const isCentromere = cytoband.gieStain === "acen";
                if (isCentromere) {
                    // Cover up the outside border
                    children.push(
                        <rect
                            key={name + startX + "-stroke-eraser"}
                            x={startX}
                            y={TOP_PADDING - 1}
                            width={drawWidth}
                            height={HEIGHT + 2}
                            fill="white"
                        />
                    );
                }
                // Centromeres are 3/5 the height.  When drawing them, we add 1/5 to the y so there's 1/5 HEIGHT top and
                // bottom padding
                children.push(
                    <rect
                        key={name + startX + "-rect"}
                        x={startX}
                        y={isCentromere ? TOP_PADDING + 0.2 * HEIGHT : TOP_PADDING}
                        width={drawWidth}
                        height={isCentromere ? 0.6 * HEIGHT : HEIGHT}
                        fill={colors.bandColor}
                    />
                );
            }

            const estimatedLabelWidth = name.length * CYTOBAND_LABEL_SIZE;
            if (estimatedLabelWidth < drawWidth) {
                // Cytoband label, if it fits
                children.push(
                    <text
                        key={name + startX + "-text"}
                        x={startX + drawWidth / 2}
                        y={TOP_PADDING + HEIGHT / 2 + 3}
                        style={{
                            textAnchor: "middle",
                            fill: colors.textColor,
                            fontSize: CYTOBAND_LABEL_SIZE,
                        }}
                    >
                        {name}
                    </text>
                );
            }
        }
        return children;
    }

    /**
     * Gets the cytoband elements to draw within a genomic interval.
     *
     * @param {ChromosomeInterval} locus - genetic locus for which to draw cytobands
     * @param {LinearDrawingModel} drawModel - draw model to use
     * @return {JSX.Element[]} cytoband elements
     */
    renderCytobandsInLocus(locus, drawModel) {
        const cytobandsForChr = this.props.genomeConfig.cytobands[locus.chr] || [];
        let children = [];
        for (let cytoband of cytobandsForChr) {
            const cytobandLocus = new ChromosomeInterval(cytoband.chrom, cytoband.chromStart, cytoband.chromEnd);
            if (cytobandLocus.getOverlap(locus)) {
                children.push(this.renderOneCytoband(cytoband, cytobandLocus, drawModel));
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
        return FEATURE_LABEL_SIZES.find((size) => label.length * size * 0.6 < maxWidth);
    }

    renderSequences() {
        const { viewRegion, width, drawHeights, zeroLine, height, hideCytoband, minXwidthPerBase } = this.props;
        const placedSequences = this.featurePlacer.placeFeatures(this.state.sequenceData, viewRegion, width);
        return placedSequences.map((placement, i) => {
            const { feature, visiblePart, xSpan, isReverse } = placement;
            const { relativeStart, relativeEnd } = visiblePart;
            if (hideCytoband) {
                return (
                    <Sequence
                        key={i}
                        sequence={feature.sequence.substring(relativeStart, relativeEnd)}
                        xSpan={xSpan}
                        y={3}
                        isReverseComplement={isReverse}
                        drawHeights={drawHeights}
                        zeroLine={zeroLine}
                        height={height}
                        letterSize={0}
                        minXwidthPerBase={minXwidthPerBase}
                        isDrawBackground={false}
                    />
                );
            } else {
                return (
                    <Sequence
                        key={i}
                        sequence={feature.sequence.substring(relativeStart, relativeEnd)}
                        xSpan={xSpan}
                        y={TOP_PADDING}
                        isReverseComplement={isReverse}
                    />
                );
            }
        });
    }

    /**
     * Redraws all the feature boxes
     *
     * @override
     */
    render() {
        const { viewRegion, width, labelOffset, hideChromName, hideCytoband, minXwidthPerBase } = this.props;
        const drawModel = new LinearDrawingModel(viewRegion, width);

        let boxesAndLabels = [];
        if (!hideCytoband) {
            let x = 0;
            let chromosomeNames = [];
            for (const segment of viewRegion.getFeatureSegments()) {
                const drawWidth = drawModel.basesToXWidth(segment.getLength());
                boxesAndLabels.push(
                    <rect // Box for feature
                        key={"rect" + x}
                        x={x}
                        y={TOP_PADDING}
                        width={drawWidth}
                        height={HEIGHT}
                        style={{ stroke: "#000", fill: "#fff" }}
                        opacity="0.5"
                    />
                );

                if (x > 0) {
                    // Thick line at boundaries of each feature, except the first one
                    boxesAndLabels.push(
                        <line
                            key={"line" + x}
                            x1={x}
                            y1={0}
                            x2={x}
                            y2={TOP_PADDING * 2 + HEIGHT}
                            stroke={"#000"}
                            strokeWidth={1}
                        />
                    );
                }

                // const labelSize = this.getSizeForFeatureLabel(segment.getName(), drawWidth);
                if (!NavigationContext.isGapFeature(segment.feature)) {
                    if (
                        chromosomeNames.length > 0 &&
                        segment.getName() === chromosomeNames[chromosomeNames.length - 1].name
                    ) {
                        chromosomeNames[chromosomeNames.length - 1].end = x + drawWidth;
                    } else {
                        chromosomeNames.push({
                            name: segment.getName(),
                            start: x,
                            end: x + drawWidth,
                        });
                    }
                }

                x += drawWidth;
            }

            if (!hideChromName) {
                chromosomeNames.forEach((chromosomeName) => {
                    const chrSize = this.getSizeForFeatureLabel(
                        chromosomeName.name,
                        drawModel.basesToXWidth(chromosomeName.end - chromosomeName.start)
                    );
                    boxesAndLabels.push(
                        // Label for feature, if it fits
                        <text
                            key={"text" + chromosomeName.start}
                            x={(chromosomeName.start + chromosomeName.end) / 2}
                            y={labelOffset || DEFAULT_LABEL_OFFSET}
                            style={{
                                textAnchor: "middle",
                                fontWeight: "bold",
                                fontSize: chrSize,
                            }}
                        >
                            {chromosomeName.name}
                        </text>
                    );
                });
            }
        }

        const cytobands = hideCytoband
            ? null
            : viewRegion.getGenomeIntervals().map((locus) => this.renderCytobandsInLocus(locus, drawModel));

        return (
            <TranslatableG x={this.props.x} y={this.props.y}>
                {boxesAndLabels}
                {cytobands}
                {drawModel.basesToXWidth(1) > minXwidthPerBase && this.renderSequences()}
            </TranslatableG>
        );
    }
}

export default Chromosomes;
