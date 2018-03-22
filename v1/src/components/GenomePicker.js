import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import allGenomes from '../model/genomes/allGenomes';
import { ActionCreators } from '../AppState';

const callbacks = { onGenomeSelected: ActionCreators.setGenome };

class GenomePicker extends React.PureComponent {
    static propTypes = {
        onGenomeSelected: PropTypes.func, // Called on genome selection.  Sigature: (genomeIndex: number): void
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedValue: 0
        };
    }

    renderGenomeOption(config, index) {
        return <option key={index} value={index} >{config.genome.getName()}</option>
    }

    render() {
        return (
        <div>
            <h1>Select a genome</h1>
            <select
                value={this.state.selectedValue}
                onChange={event => this.setState({selectedValue: event.target.value})}
            >
                {allGenomes.map(this.renderGenomeOption)}
            </select>
            <button onClick={() => this.props.onGenomeSelected(this.state.selectedValue)} >Confirm</button>
        </div>
        );
    }
}

export default connect(null, callbacks)(GenomePicker);
