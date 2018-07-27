import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import allGenomes from '../model/genomes/allGenomes';
import { ActionCreators } from '../AppState';

import './GenomePicker.css';

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
        this.chooseSpecies = this.chooseSpecies.bind(this);
        this.chooseAssembly = this.chooseAssembly.bind(this);
    }

    renderGenomeOption(config, index) {
        const genomeName = config.genome.getName();
        return <button key={index} onClick={() => this.props.onGenomeSelected(genomeName)} >{genomeName}</button>;
    }

    chooseSpecies(event) {
        this.setState({species: event.currentTarget.value, assembly: ''});
    }

    chooseAssembly(event) {
        this.setState({assembly: event.currentTarget.value});
    }

    renderTree() {
        let divList = []
        for (const [species, details] of Object.entries(treeOfLife) ) {
            divList.push( <div className="GenomePicker-one-species" key={species}>
                <label for={species}>
                    <input type="radio" id={species} value={species} 
                        checked={this.state.species === species} 
                        onChange={this.chooseSpecies} />
                    <div>{species}</div>
                    <div><img src={details.logo} alt={species}/></div>
                </label>
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
                <label for={assembly}>
                    <input type="radio" id={assembly} value={assembly} 
                        checked={this.state.assembly === assembly} 
                        onChange={this.chooseAssembly} />
                    {assembly}
                </label>
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
