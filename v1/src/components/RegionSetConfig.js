import React from 'react';
import PropTypes from 'prop-types';

import FlankingStratConfig from './FlankingStratConfig';

import Genome from '../model/Genome';
import Feature from '../model/Feature';
import FlankingStrategy from '../model/FlankingStrategy';
import RegionSet from '../model/RegionSet';
import ChromosomeInterval from '../model/interval/ChromosomeInterval';

class RegionSetConfig extends React.Component {
    static propTypes = {
        /**
         * The genome, used to determine coordinates of the regions in the set
         */
        genome: PropTypes.instanceOf(Genome).isRequired,
        set: PropTypes.instanceOf(RegionSet), // The set with which to initalize the config panel
        /**
         * Called with a new RegionSet when configuration is finished.  Signature:
         *     (new: RegionSet): void
         */
        onSetConfigured: PropTypes.func,

        /**
         * Called when the user requests that this component be closed.  Signature: (void): void
         */
        onClose: PropTypes.func,
    };

    static defaultProps = {
        onSetConfigured: () => undefined
    };

    constructor(props) {
        super(props);
        const set = this.getRegionSetFromProps(props);
        this.state = {
            set: set,
            newRegionName: "",
            newRegionLocus: "",
            newRegionError: null,
        };
        this.changeSetName = this.changeSetName.bind(this);
        this.changeSetStrategy = this.changeSetStrategy.bind(this);
        this.addRegion = this.addRegion.bind(this);
        this.deleteRegion = this.deleteRegion.bind(this);
    }

    getRegionSetFromProps(props) {
        return props.set || new RegionSet("", [], props.genome, new FlankingStrategy());
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.set !== nextProps.set) {
            this.setState({set: this.getRegionSetFromProps(nextProps)});
        }
    }

    changeSetName(event) {
        this.setState({set: this.state.set.cloneAndSet("name", event.target.value)});
    }

    changeSetStrategy(newStrat) {
        this.setState({set: this.state.set.cloneAndSet("flankingStrategy", newStrat)});
    }

    addRegion() {
        let newSet = null;
        try {
            const locus = ChromosomeInterval.parse(this.state.newRegionLocus);
            if (!locus) {
                throw new RangeError("Could not parse locus");
            }
            newSet = this.state.set.cloneAndAddFeature(new Feature(this.state.newRegionName, locus));
        } catch (error) {
            this.setState({newRegionError: error});
        }
        if (newSet) {
            this.setState({
                set: newSet,
                newRegionName: "",
                newRegionLocus: "",
                newRegionError: null
            });
        }
    }

    deleteRegion(index) {
        this.setState({set: this.state.set.cloneAndDeleteFeature(index)});
    }

    renderRegions() {
        if (!this.state.set) {
            return [];
        }

        const features = this.state.set.features;
        const flankedFeatures = this.state.set.makeFlankedFeatures();

        let rows = [];
        for (let i = 0; i < features.length; i++) {
            if (!features[i]) {
                continue;
            }

            rows.push(<tr key={i}>
                <td>{features[i].getName()}</td>
                <td>{features[i].getCoordinates().toString()}</td>
                <td>{flankedFeatures[i].getCoordinates().toString()}</td>
                <td><button onClick={() => this.deleteRegion(i)}>Delete</button></td>
            </tr>);
        }

        return rows;
    }

    render() {
        return (
        <div>
            <h3>{this.props.set ? `Configuring set: "${this.props.set.name}"` : "Create new set"}</h3>
            <label>
                Enter name
                <input
                    type="text"
                    placeholder="Set name"
                    value={this.state.set.name}
                    onChange={this.changeSetName}
                />
            </label>
            <table className="table">
                <thead>
                    <tr><th>Name</th><th>Locus</th><th>Coordinates to view</th></tr>
                </thead>
                <tbody>{this.renderRegions()}</tbody>
            </table>
            <div>
                <label>
                    New region name
                    <input
                        type="text"
                        value={this.state.newRegionName}
                        onChange={event => this.setState({newRegionName: event.target.value})}
                    />
                </label>
                <label>
                    New region locus
                    <input
                        type="text"
                        value={this.state.newRegionLocus}
                        onChange={event => this.setState({newRegionLocus: event.target.value})}
                    />
                </label>
                <button onClick={this.addRegion}>Add new region</button>
                {this.state.newRegionError ? this.state.newRegionError.message : null}
            </div>
            <FlankingStratConfig
                strategy={this.state.set.flankingStrategy}
                onNewStrategy={this.changeSetStrategy}
                />
            <div>
                <button
                    onClick={() => this.props.onSetConfigured(this.state.set)}
                    disabled={this.state.set === this.props.set}
                >
                    Save changes
                </button>
                <button onClick={() => this.setState({set: this.props.set})}>Cancel</button>
            </div>
        </div>
        );
    }
}

export default RegionSetConfig;
