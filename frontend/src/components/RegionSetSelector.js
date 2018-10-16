import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ActionCreators } from '../AppState';

import RegionSetConfig from './RegionSetConfig';

import RegionSet from '../model/RegionSet';
import Genome from '../model/genomes/Genome';

/**
 * Gets props to pass to RegionSetSelector.
 * 
 * @param {Object} state - redux state
 * @return {Object} props to pass to RegionSetSelector
 */
function mapStateToProps(state) {
    return {
        sets: state.browser.present.regionSets,
        selectedSet: state.browser.present.regionSetView
    };
}

/**
 * Callbacks to pass to RegionSetSelector.
 */
const callbacks = {
    onSetsChanged: ActionCreators.setRegionSetList,
    onSetSelected: ActionCreators.setRegionSetView,
};

/**
 * Region set selector and config.  Can enter/exit region set view, and add/delete/modify region sets.
 * 
 * @author Silas Hsu
 */
class RegionSetSelector extends React.Component {
    static propTypes = {
        genome: PropTypes.instanceOf(Genome).isRequired, // Current genome, used to ensure regions stay in the genome
        sets: PropTypes.arrayOf(PropTypes.instanceOf(RegionSet)).isRequired, // Currently available region sets
        selectedSet: PropTypes.instanceOf(RegionSet), // Region set backing current region set view, if applicable
        /**
         * Callback to change available region sets.  Signature: (newSets: RegionSet[]): void
         */
        onSetsChanged: PropTypes.func,
        /**
         * Callback to change region set view.  Signature: (set: RegionSet): void
         *     `set` - set with which to enter region set view, or null to exit region set view
         */
        onSetSelected: PropTypes.func,
    };

    static defaultProps = {
        onSetsChanged: () => undefined,
        onSetSelected: () => undefined
    }

    constructor(props) {
        super(props);
        this.state = {
            indexBeingConfigured: 0
        };
        this.setConfigured = this.setConfigured.bind(this);
        this.deleteSet = this.deleteSet.bind(this);
        this.renderItemForSet = this.renderItemForSet.bind(this);
    }

    /**
     * Requests an add or a change in the available region set list.  Assumes that if there is no existing set being
     * configured, it must be an add.
     * 
     * @param {RegionSet} newSet - newly configured set
     */
    setConfigured(newSet) {
        const indexBeingConfigured = this.state.indexBeingConfigured;
        if (indexBeingConfigured < 0 || indexBeingConfigured >= this.props.sets.length) {
            this.addSet(newSet); // Index being configured out of bounds -- doesn't exist in current set list yet
        } else {
            this.replaceSet(indexBeingConfigured, newSet);
        }
    }

    addSet(newSet) {
        const nextSets = this.props.sets.slice();
        nextSets.push(newSet);
        this.props.onSetsChanged(nextSets);
    }

    replaceSet(index, replacement) {
        const nextSets = this.props.sets.slice();
        nextSets[index] = replacement;
        this.props.onSetsChanged(nextSets);
        this.handleSetChangeSideEffects(index, replacement);
    }

    deleteSet(index) {
        const nextSets = this.props.sets.filter((unused, i) => i !== index);
        if (nextSets.length !== this.props.sets.length) {
            this.props.onSetsChanged(nextSets);
            this.handleSetChangeSideEffects(index, null);
        }
    }

    /**
     * Requests a 
     * @param {number} changedIndex 
     * @param {*} replacement 
     */
    handleSetChangeSideEffects(changedIndex, newSet) {
        const oldSet = this.props.sets[changedIndex];
        if (oldSet === this.props.selectedSet) {
            this.props.onSetSelected(newSet);
        }
    }

    renderItemForSet(set, index) {
        const isBackingView = set === this.props.selectedSet;
        const numRegions = set.features.length;
        const name = set.name || "Unnamed set";
        const text = `${name} (${numRegions} regions)`;

        let useSetButton;
        if (isBackingView) {
            useSetButton = <button className="btn btn-sm btn-info" disabled={true} >Is current view</button>;
        } else {
            useSetButton = (
                <button className="btn btn-sm btn-success" onClick={() => this.props.onSetSelected(set)} disabled={numRegions <= 0} >
                    Enter region set view
                </button>
            );
        }

        const deleteButton = <button className="btn btn-sm btn-danger" onClick={() => this.deleteSet(index)} >DELETE</button>;

        return (
        <div key={index} style={{backgroundColor: isBackingView ? "lightgreen" : undefined}} >
            <button title="Click to edit" className="btn btn-link" onClick={() => this.setState({indexBeingConfigured: index})} >
                {text}
            </button> {useSetButton} {deleteButton}
        </div>
        );
    }

    render() {
        const {genome, sets, selectedSet, onSetSelected} = this.props;
        const setBeingConfigured = sets[this.state.indexBeingConfigured];
        return (
        <div>
            <h3>Select a gene/region set</h3>
            {selectedSet ? <button className="btn btn-sm btn-warning" onClick={() => onSetSelected(null)} >Exit region set view</button> : null }
            {sets.map(this.renderItemForSet)}
            <button className="btn btn-sm btn-primary" onClick={() => this.setState({indexBeingConfigured: sets.length})} >Add new set</button>
            <RegionSetConfig
                genome={genome}
                set={setBeingConfigured}
                onSetConfigured={this.setConfigured}
            />
        </div>
        );
    }
}

export default connect(mapStateToProps, callbacks)(RegionSetSelector);
