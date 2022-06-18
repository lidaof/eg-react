import React from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { StandaloneGeneAnnotation } from "./StandaloneGeneAnnotation";
import withCurrentGenome from "../withCurrentGenome";
import Gene from "../../model/Gene";
import { Genome } from "../../model/genomes/Genome";
import LinearDrawingModel from "../../model/LinearDrawingModel";
import DisplayedRegionModel from "../../model/DisplayedRegionModel";
import NavigationContext from "../../model/NavigationContext";
import { AWS_API } from "../../dataSources/GeneSource";

import "./IsoformSelection.css";

const DRAW_WIDTH = 200;

/**
 * Isoform selection table.
 *
 * @author Silas Hsu
 */
class IsoformSelection extends React.PureComponent {
    static propTypes = {
        /**
         * Genome config to use.  Needed because if genes are on different chromosomes, we need to know chromosome
         * lengths to draw gene locations to scale.
         */
        genomeConfig: PropTypes.shape({
            genome: PropTypes.instanceOf(Genome),
            navContext: PropTypes.instanceOf(NavigationContext),
        }).isRequired,
        geneName: PropTypes.string, // Gene name to query
        onGeneSelected: PropTypes.func, // Callback for when a gene is selected.  Signature: (gene: Gene): void
        simpleMode: PropTypes.bool,
    };

    static defaultProps = {
        geneName: "",
        onGeneSelected: () => undefined,
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            genes: [],
        };
        this.getSuggestions(props.geneName);
    }

    async getSuggestions(geneName) {
        const genomeName = this.props.genomeConfig.genome.getName();
        const chrListObject = this.props.genomeConfig.navContext._featuresForChr;
        const params = {
            q: geneName,
            isExact: true,
        };
        const response = await axios.get(`${AWS_API}/${genomeName}/genes/queryName`, { params: params });
        // filter out genes in super contigs in case those are not in chrom list
        const recordsInFeatures = response.data.filter((record) => chrListObject.hasOwnProperty(record.chrom));
        const genes = recordsInFeatures.map((record) => new Gene(record));
        this.setState({ isLoading: false, genes: genes });
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const nextGeneName = nextProps.geneName.trim();
        if (this.props.geneName.trim() !== nextGeneName) {
            this.setState({ isLoading: true });
            this.getSuggestions(nextGeneName);
        }
    }

    renderSuggestions() {
        const { color, background, genomeConfig } = this.props;
        const navContext = genomeConfig.navContext;
        const contextIntervals = this.state.genes.map((gene) => gene.computeNavContextCoordinates(navContext)[0]);
        const leftmostStart = Math.min(...contextIntervals.map((location) => location.start));
        const rightmostEnd = Math.max(...contextIntervals.map((location) => location.end));
        const viewRegion = new DisplayedRegionModel(navContext, leftmostStart, rightmostEnd);
        const drawModel = new LinearDrawingModel(viewRegion, DRAW_WIDTH);

        const renderOneSuggestion = (gene, i) => {
            return (
                <div
                    key={gene.dbRecord._id}
                    className="IsoformSelection-item"
                    onClick={() => this.props.onGeneSelected(gene)}
                    style={{
                        color,
                        background,
                    }}
                >
                    <div className="IsoformSelection-collection">{gene.collection}</div>
                    <div>{gene.getLocus().toString()}</div>
                    <div>
                        <StandaloneGeneAnnotation
                            gene={gene}
                            contextLocation={contextIntervals[i]}
                            xSpan={drawModel.baseSpanToXSpan(contextIntervals[i])}
                            elementWidth={DRAW_WIDTH}
                        />
                    </div>
                    <div className="IsoformSelection-description">{gene.description}</div>
                </div>
            );
        };

        return <div className="IsoformSelection">{this.state.genes.map(renderOneSuggestion)}</div>;
    }

    renderSuggestionsSimple() {
        const { color, background, genomeConfig } = this.props;
        const navContext = genomeConfig.navContext;
        const contextIntervals = this.state.genes.map((gene) => gene.computeNavContextCoordinates(navContext)[0]);
        const leftmostStart = Math.min(...contextIntervals.map((location) => location.start));
        const rightmostEnd = Math.max(...contextIntervals.map((location) => location.end));
        const viewRegion = new DisplayedRegionModel(navContext, leftmostStart, rightmostEnd);
        const drawModel = new LinearDrawingModel(viewRegion, DRAW_WIDTH);

        const renderOneSuggestion = (gene, i) => {
            return (
                <div
                    key={gene.dbRecord._id}
                    className="IsoformSelection-item-simple"
                    onClick={() => this.props.onGeneSelected(gene)}
                    style={{
                        color,
                        background,
                    }}
                >
                    <div>{gene.getLocus().toString()}</div>
                    <div>
                        <StandaloneGeneAnnotation
                            gene={gene}
                            contextLocation={contextIntervals[i]}
                            xSpan={drawModel.baseSpanToXSpan(contextIntervals[i])}
                            elementWidth={DRAW_WIDTH}
                        />
                    </div>
                </div>
            );
        };

        return <div className="IsoformSelection">{this.state.genes.map(renderOneSuggestion)}</div>;
    }

    render() {
        if (this.state.isLoading) {
            return "Loading...";
        }

        if (this.state.genes.length === 0) {
            return `Could not find gene "${this.props.geneName}"`;
        }
        if (this.props.simpleMode) {
            return this.renderSuggestionsSimple();
        } else {
            return this.renderSuggestions();
        }
    }
}

export default withCurrentGenome(IsoformSelection);
