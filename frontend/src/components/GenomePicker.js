import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import allGenomes from '../model/genomes/allGenomes';
import { ActionCreators } from '../AppState';
import './GenomePicker.css';
import withAutoDimensions from './withAutoDimensions';

const callbacks = { onGenomeSelected: ActionCreators.setGenome };

const treeOfLife = {
    human: {logo: 'http://epigenomegateway.wustl.edu/browser/images/Human.png', assemblies: ['hg19', 'hg38']},
    mouse: {logo: 'http://epigenomegateway.wustl.edu/browser/images/Mouse.png', assemblies: ['mm10']},
    zebrafish: {logo: 'http://epigenomegateway.wustl.edu/browser/images/Zebrafish.png', assemblies: ['danRer10']},
};

class GenomePicker extends React.PureComponent {
    static propTypes = {
        onGenomeSelected: PropTypes.func, // Called on genome selection.  Sigature: (genomeName: string): void
    };

    constructor(props) {
        super(props);
        this.state = {
            species: '',
            assembly: '',
        };
        this.renderGenomeOption = this.renderGenomeOption.bind(this);
    }

    renderGenomeOption(config, index) {
        const genomeName = config.genome.getName();
        return <button key={index} onClick={() => this.props.onGenomeSelected(genomeName)} >{genomeName}</button>;
    }

    chooseSpecies(species) {
        this.setState({species, assembly: ''});
    }

    chooseAssembly(assembly) {
        this.setState({assembly});
    }

    renderTree() {
        let divList = []
        for (const [species, details] of Object.entries(treeOfLife) ) {
            divList.push( <div className="GenomePicker-one-species" key={species} onClick={() => this.chooseSpecies(species)}>
                <div>{species}</div>
                <div><img src={details.logo} alt={species}/></div>
            </div>
            )
        }
        return divList;
    }

    renderAssembly() {
        let divList = [];
        const assemblies = treeOfLife[this.state.species].assemblies;
        for (const assembly of assemblies) {
            divList.push(
                <div key={assembly} onClick={() => this.chooseAssembly(assembly)}>{assembly}</div>
            )
        }
        return divList;
    }

    render() {
        return (
        // <div style={{display: "flex", flexDirection: "column", alignItems: "flex-start"}}>
        //     <h1>Select a genome</h1>
        //     {allGenomes.map(this.renderGenomeOption)}
        // </div>
        <div className="GenomePicker-main">
            <div className="GenomePicker-species capitalize">
                {this.renderTree()}
            </div> 
            <div className="GenomePicker-assembly">
                { this.state.species && this.renderAssembly() }
            </div>
            <div className="GenomePicker-holder">
                <div className="capitalize">{this.state.species}</div>
                <div>{this.state.assembly}</div>
            </div>
            <div className="GenomePicker-go">
                {
                    this.state.assembly && <button onClick={() => this.props.onGenomeSelected(this.state.assembly)} >Go  &#8658;</button>
                }  
            </div>
        </div>
        );
    }
}

export default connect(null, callbacks)(GenomePicker);
