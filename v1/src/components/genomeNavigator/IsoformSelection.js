import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import StandaloneGeneAnnotation from './StandaloneGeneAnnotation';

import Gene from '../../model/Gene';
import LinearDrawingModel from '../../model/LinearDrawingModel';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import HG19 from '../../model/genomes/hg19/hg19';

import './IsoformSelection.css';
import GeneDescription from '../GeneDescription';

const DRAW_WIDTH = 200;

/**
 * Isoform selection table
 * 
 * @author Silas Hsu
 */
class IsoformSelection extends React.PureComponent {
    static propTypes = {
        geneName: PropTypes.string, // Gene name to query
        onGeneSelected: PropTypes.func // Callback for when a gene is selected.  Signature: (gene: Gene): void
    };

    static defaultProps = {
        geneName: '',
        onGeneSelected: () => undefined
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            genes: []
        };
        this.getSuggestions(props.geneName);
    }

    async getSuggestions(geneName) {
        const response = await axios.get(`/hg19/refGene/${geneName}`);
        const genes = response.data.map(record => {
            let gene = new Gene(record);
            gene.computeNavContextCoordinates(HG19.context); // TODO we might want to use a diff context later
            return gene;
        });
        this.setState({isLoading: false, genes: genes});
    }

    componentWillReceiveProps(nextProps) {
        const nextGeneName = nextProps.geneName.trim();
        if (this.props.geneName.trim() !== nextGeneName) {
            this.setState({isLoading: true});
            this.getSuggestions(nextGeneName);
        }
    }

    renderSuggestions() {
        const genes = this.state.genes;
        const leftmostStart = Math.min(...genes.map(gene => gene.absStart));
        const rightmostEnd = Math.max(...genes.map(gene => gene.absEnd));
        const viewRegion = new DisplayedRegionModel(HG19.context, leftmostStart, rightmostEnd);
        const drawModel = new LinearDrawingModel(viewRegion, DRAW_WIDTH);

        const renderOneSuggestion = gene => (
            <tr
                key={gene.refGeneRecord._id}
                className="IsoformSelection-item"
                onClick={() => this.props.onGeneSelected(gene)}
            >
                <td>{gene.getLocus().toString()}</td>
                <td><StandaloneGeneAnnotation gene={gene} drawModel={drawModel} /></td>
                <td className="IsoformSelection-description"><GeneDescription gene={gene} /></td>
            </tr>
        );
        
        return (
        <table className="IsoformSelection">
            <tbody>
                {genes.map(renderOneSuggestion)}
            </tbody>
        </table>
        );
    }

    render() {
        if (this.state.isLoading) {
            return "Loading...";
        }

        if (this.state.genes.length === 0) {
            return `Could not find gene "${this.props.geneName}"`;
        }

        return this.renderSuggestions();
    }
}

export default IsoformSelection;
