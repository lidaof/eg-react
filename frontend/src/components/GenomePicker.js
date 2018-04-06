import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import allGenomes from '../model/genomes/allGenomes';
import { ActionCreators } from '../AppState';

const callbacks = { onGenomeSelected: ActionCreators.setGenome };

class GenomePicker extends React.PureComponent {
    static propTypes = {
        onGenomeSelected: PropTypes.func, // Called on genome selection.  Sigature: (genomeName: string): void
    };

    constructor(props) {
        super(props);
        this.renderGenomeOption = this.renderGenomeOption.bind(this);
    }

    renderGenomeOption(config, index) {
        const genomeName = config.genome.getName();
        return <button key={index} onClick={() => this.props.onGenomeSelected(genomeName)} >{genomeName}</button>;
    }

    render() {
        return (
        <div style={{display: "flex", flexDirection: "column", alignItems: "flex-start"}}>
            <h1>Select a genome</h1>
            {allGenomes.map(this.renderGenomeOption)}
        </div>
        );
    }
}

export default connect(null, callbacks)(GenomePicker);
