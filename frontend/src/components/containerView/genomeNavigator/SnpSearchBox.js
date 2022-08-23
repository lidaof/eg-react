import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import axios from 'axios';

import withCurrentGenome from '../../withCurrentGenome';
import NavigationContext from '../../../model/NavigationContext';
import { Genome } from '../../../model/genomes/Genome';
import { notify } from 'react-notify-toast';
import ChromosomeInterval from '../../../model/interval/ChromosomeInterval';

const DEBOUNCE_INTERVAL = 250;
/**
 * Ensembl uses a one-based coordinate system, whereas UCSC uses a zero-based coordinate system.
 * https://useast.ensembl.org/Help/Faq?id=286
 */
const SNP_ENDPOINTS = {
    'hg19': 'https://grch37.rest.ensembl.org/variation/human',
    'hg38': 'https://rest.ensembl.org/variation/human',
}

/**
 * A box that accepts SNP id search.
 * 
 * @author Daofeng Li and Silas Hsu
 */
class SnpSearchBox extends React.PureComponent {
    static propTypes = {
        genomeConfig: PropTypes.shape({ // Current genome
            genome: PropTypes.instanceOf(Genome).isRequired
        }).isRequired,
        navContext: PropTypes.instanceOf(NavigationContext).isRequired, // The current navigation context

        /**
         * Called when the user chooses a gene and wants to go to it in the nav context.  Signature:
         *     (newStart: number, newEnd: number): void
         *         `newStart`: the nav context coordinate of the start of the view interval
         *         `newEnd`: the nav context coordinate of the end of the view interval
         */
        onRegionSelected: PropTypes.func.isRequired,
        handleCloseModal: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            inputValue: '', //user's input
            result: null, // found snp
            loadingMsg: '',
        };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.searchSnp = _.debounce(this.searchSnp.bind(this), DEBOUNCE_INTERVAL);
        this.setViewToSnp = this.setViewToSnp.bind(this);

    }

    handleInputChange(event) {
        this.setState({inputValue: event.target.value});
    }

    async searchSnp() {
        const {inputValue} = this.state;
        const input = inputValue.trim();
        if (input.length < 1) {
            notify.show('Please input a valid SNP id.', 'error', 2000);
            return;
        }
        const genomeName = this.props.genomeConfig.genome.getName();
        const endpoint = SNP_ENDPOINTS[genomeName];
        if(!endpoint) {
            notify.show('This genome is not supported in SNP search.', 'error', 2000);
            return;
        }
        this.setState({loadingMsg: 'searching...'});
        const params = {
            'content-type': 'application/json',
        };
        const response = await axios.get(`${endpoint}/${input}`, {params: params});
        this.setState({result: response.data, loadingMsg: ''});
    }
    /**
     * @param {Object} 
     * allele_string: "G/A"
        assembly_name: "GRCh37"
        coord_system: "chromosome"
        end: 212464
        location: "11:212464-212464"
        seq_region_name: "11"
        start: 212464
        strand: 1
     */
    setViewToSnp(entry) {
        const chrInterval = new ChromosomeInterval(`chr${entry.seq_region_name}`, entry.start - 1, entry.end)
        const interval = this.props.navContext.convertGenomeIntervalToBases(chrInterval)[0];
        if (interval) {
            this.props.onRegionSelected(...interval);
            this.props.handleCloseModal();
            this.props.onSetEnteredRegion(chrInterval);
        } else {
            notify.show("SNP not available in current region set view",  'error', 2000);
        }
    }

    renderSNP = (snp) => {
        const synonyms = snp.synonyms.map((item,i) => <li key={i}>{item}</li>);
        const mappings = snp.mappings.map((item,i) => 
            <li style={{
                color: 'blue', textDecoration: 'underline', cursor: 'pointer'}} 
                key={i} onClick={() => this.setViewToSnp(item)}>
            chr{item.location} {item.strand === 1 ? '+' : '-'} {item.allele_string}</li>
        );
        return (
            <table className="table table-sm table-striped table-bordered">
                <tbody>
                <tr><td>name</td><td>{snp.name}</td></tr>
                <tr><td>location</td><td><ol style={{marginBottom: 0}}>{mappings}</ol></td></tr>
                <tr><td>ambiguity</td><td>{snp.ambiguity}</td></tr>
                <tr><td>ancestral_allele</td><td>{snp.ancestral_allele}</td></tr>
                <tr><td>synonyms</td><td><ol tyle={{marginBottom: 0}}>{synonyms}</ol></td></tr>
                <tr><td>source</td><td>{snp.source}</td></tr>
                </tbody>
            </table>
        );
    }

    render() {
        const {result, loadingMsg} = this.state;
        return (
        <div>
            <div>
            <input type="text" size={20} placeholder="SNP id" onChange={this.handleInputChange} />
            <button 
                    className="btn btn-secondary btn-sm" 
                    style={{marginLeft: "2px"}}
                    onClick={this.searchSnp}
                >Go</button> <span className="text-info font-italic">{loadingMsg}</span>
            </div>
            <div style={{position: "absolute", zIndex: 2, backgroundColor: "white"}}>
                {result && this.renderSNP(result)}
            </div>
        </div>
        );
    }
}

export default withCurrentGenome(SnpSearchBox);
