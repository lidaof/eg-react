import React from 'react';
import PropTypes from 'prop-types';

import RegionSetConfig from './RegionSetConfig';

import RegionSet from '../model/RegionSet';
import FlankingStrategy from '../model/FlankingStrategy';
import Feature from '../model/Feature';
import Genome from '../model/genomes/Genome';
import ChromosomeInterval from '../model/interval/ChromosomeInterval';

const GENES = [
    new Feature("CYP2C8", new ChromosomeInterval("chr10", 96796528, 96829254), false),
    new Feature("CYP4B1", new ChromosomeInterval("chr1", 47223509, 47276522), true),
    new Feature("CYP11B2", new ChromosomeInterval("chr8", 143991974, 143999259), false),
    new Feature("CYP26B1", new ChromosomeInterval("chr2", 72356366, 72375167), false),
    new Feature("CYP51A1", new ChromosomeInterval("chr7", 91741462, 91764059), false),
];

class RegionSetSelector extends React.Component {
    static propTypes = {
        genome: PropTypes.instanceOf(Genome).isRequired,
        onSetSelected: PropTypes.func,
    };

    static defaultProps = {
        onSetSelected: () => undefined
    }

    constructor(props) {
        super(props);
        const set = new RegionSet("My set", GENES, props.genome, new FlankingStrategy());
        this.state = {
            sets: [set], // Array of RegionSet
            indexBeingConfigured: 0
        };
        this.renderItemForSet = this.renderItemForSet.bind(this);
        this.setConfigured = this.setConfigured.bind(this);
    }

    setConfigured(newSet) {
        let newSets = this.state.sets.slice();
        let indexBeingConfigured = this.state.indexBeingConfigured;
        if (!newSets[this.state.indexBeingConfigured]) {
            indexBeingConfigured = newSets.push(newSet) - 1;
        } else {
            newSets[this.state.indexBeingConfigured] = newSet;
        }
        this.setState({
            sets: newSets,
            indexBeingConfigured: indexBeingConfigured
        });
    }

    renderItemForSet(set, index) {
        const numRegions = set.features.length;
        const name = set.name || "Unnamed set";
        const text = `${name} (${numRegions} regions)`;
        return (
        <div key={index}>
            {text}
            <button onClick={() => this.setState({indexBeingConfigured: index})}>Configure</button>
            <button
                onClick={() => this.props.onSetSelected(set)}
                disabled={numRegions <= 0}
            >
                Enter gene set view
            </button>
        </div>
        );
    }

    render() {
        const setBeingConfigured = this.state.sets[this.state.indexBeingConfigured];
        return (
        <div>
            <h3>Select a gene/region set</h3>
            {this.state.sets.map(this.renderItemForSet)}
            <button onClick={() => this.setState({indexBeingConfigured: -1})} >Create new set...</button>
            <RegionSetConfig
                genome={this.props.genome}
                set={setBeingConfigured}
                onSetConfigured={this.setConfigured}
            />
        </div>
        );
    }
}

export default RegionSetSelector;
