import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { notify } from 'react-notify-toast';
import ReactTable from "react-table";
import FlankingStratConfig from './FlankingStratConfig';
import Genome from '../model/genomes/Genome';
import Feature from '../model/Feature';
import FlankingStrategy from '../model/FlankingStrategy';
import RegionSet from '../model/RegionSet';
import ChromosomeInterval from '../model/interval/ChromosomeInterval';
import { AWS_API } from '../dataSources/GeneSource';

import "react-table/react-table.css";

/**
 * Placeholder genes for a new set
 */
const GENES = [
    new Feature("CYP2C8", new ChromosomeInterval("chr10", 96796528, 96829254), "-"),
    new Feature("CYP4B1", new ChromosomeInterval("chr1", 47223509, 47276522), "+"),
    new Feature("CYP11B2", new ChromosomeInterval("chr8", 143991974, 143999259), "-"),
    new Feature("CYP26B1", new ChromosomeInterval("chr2", 72356366, 72375167), "-"),
    new Feature("CYP51A1", new ChromosomeInterval("chr7", 91741462, 91764059), "-"),
];

const DEFAULT_LIST = `CYP4A22
chr10:96796528-96829254
CYP2A6
CYP3A4
chr1:47223509-47276522
CYP1A2
`;

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
            regionList: DEFAULT_LIST,
            loadingMsg: '',

        };
        this.changeSetName = this.changeSetName.bind(this);
        this.changeSetStrategy = this.changeSetStrategy.bind(this);
        this.addRegion = this.addRegion.bind(this);
        this.deleteRegion = this.deleteRegion.bind(this);
        this.cancelPressed = this.cancelPressed.bind(this);
        this.handleListChange = this.handleListChange.bind(this);
        this.resetList = this.resetList.bind(this);
        this.handleAddList = this.handleAddList.bind(this);
    }

    handleListChange(event) {
        this.setState({regionList: event.target.value});
    }

    resetList(event) {
        this.setState({regionList: ""});
    }

    async handleAddList(event) {
        event.preventDefault();
        this.setState({loadingMsg: 'loading'});
        const inputListRaw = this.state.regionList.trim().split('\n');
        const inputListRaw2 = inputListRaw.map(item => item.trim());
        const inputList = inputListRaw2.filter(item => item !== '')
        const promise = inputList.map((symbol) => {
            try{
                const locus = ChromosomeInterval.parse(symbol);
                if (locus) {
                    return new Feature(symbol, locus);
                }
            }catch(error) {
            }
            return this.getSymbolRegions(symbol);
        });
        const parsed = await Promise.all(promise);
        const parsed2 = parsed.map((item, index) => {
            if (Array.isArray(item)) {
                if ( item.length === 0 ) {return null;}
                const hits = item.map(gene => {
                    if (gene.name.toLowerCase() === inputList[index].toLowerCase()) {
                        return new Feature(gene.name, new ChromosomeInterval(gene.chrom, gene.txStart, gene.txEnd), gene.strand);
                    }
                });
                return hits[0] || null;
            } else {
                return item;
            }
        })
        const nullList = parsed2.filter(item => item === null);
        if (nullList.length > 0) {
            notify.show(`${nullList.length} item(s) cannot find location(s) on genome`, 'error', 2000);
        } else {
            notify.show(`${parsed2.length} region(s) added`, 'success', 2000);
        }
        this.setState({loadingMsg: ''});
        // return parsed2.filter(item => item !== null);
        const set = new RegionSet("New set",parsed2.filter(item => item !== null), this.props.genome, new FlankingStrategy());
        this.setState({set});
    }

    async getSymbolRegions(symbol) {
        const genomeName = this.props.genome.getName();
        const params = {
            q: symbol,
            getOnlyNames: false,
        };
        const response = await axios.get(`${AWS_API}/${genomeName}/genes/queryName`, {params: params});
        return response.data;
    }

    getRegionSetFromProps(props) {
        // return props.set || new RegionSet("New set", GENES, props.genome, new FlankingStrategy());
        return props.set;
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
            const feature = features[i];
            const flankedLocus = flankedFeatures[i] ? flankedFeatures[i].getLocus().toString() : "(invalid)";

            rows.push(<tr key={i}>
                <td>{feature.getName()}</td>
                <td>{feature.getLocus().toString()}</td>
                <td>{feature.getIsForwardStrand() ? "+" : "-"}</td>
                <td>{flankedLocus}</td>
                <td><button className="btn btn-sm btn-danger" onClick={() => this.deleteRegion(i)}>Delete</button></td>
            </tr>);
        }

        return rows;
    }

    isSaveButtonDisabled() {
        return this.state.set === this.props.set ||
            this.state.set.makeFlankedFeatures().some(feature => feature === null);
    }

    cancelPressed() {
        this.setState({set: this.getRegionSetFromProps(this.props)});
    }

    render() {
        const defaultFilterMethod = (filter, row) =>
        String(row[filter.id]).toLowerCase().includes(filter.value.toLowerCase());
        const features = this.state.set ? this.state.set.features: [];
        const flankedFeatures = this.state.set ? this.state.set.makeFlankedFeatures(): [];
        const columns = [
            {
                Header: "Name",
                accessor: feature => feature.getName(),
                id: "name",
            },
            {
                Header: "Locus",
                accessor: feature => feature.getLocus().toString(),
                id: "locus",
            },
            {
                Header: "Strand",
                accessor: feature => feature.getIsForwardStrand() ? "+" : "-",
                id: "strand",
            },
            {
                Header: "Coordinates to view",
                Cell: reactTableRow => flankedFeatures[reactTableRow.index] ? flankedFeatures[reactTableRow.index].getLocus().toString() : "(invalid)",
                id: "adjustedLocus",
            },
            {
                Header: "Delete",
                Cell: reactTableRow => <button className="btn btn-sm btn-danger" onClick={() => this.deleteRegion(reactTableRow.index)}>Delete</button>,
                id: "deleteLocus",
            }

        ];
        return (
        <div>
            <h3>{this.props.set ? `Editing set: "${this.props.set.name}"` : "Create a new set"}</h3>
            <label>
                Enter name
                <input
                    type="text"
                    placeholder="Set name"
                    value={this.state.set ? this.state.set.name : 'New set'}
                    onChange={this.changeSetName}
                />
            </label>
            
            <div>
                <h4>Enter a list of regions</h4>
                <p>Enter a list of gene names or coordinates to make a gene set one item per line. 
                    Gene names and coordinates can be mixed for input. Coordinate string must be in the form of "chr1:345-678"
                    fields can be joined by space/tab/comma/colon/hyphen.</p>
                <form onSubmit={this.handleAddList}>
                    <label>
                        <textarea value={this.state.regionList} onChange={this.handleListChange} rows={10} cols={40} />
                    </label>
                    <div>
                        <input className="btn btn-sm btn-primary" type="submit" value="Add" /> <input 
                            className="btn btn-sm btn-secondary" type="reset" value="Clear" onClick={this.resetList} 
                            /> <span style={{fontStyle: 'italic'}}>{this.state.loadingMsg}</span>
                    </div>
                </form>
            </div>

            <div>
                <h4>Add one region</h4>
                <label>
                    New region name: <input
                        type="text"
                        value={this.state.newRegionName}
                        onChange={event => this.setState({newRegionName: event.target.value})}
                    />
                </label> <label>
                    New region locus: <input
                        type="text"
                        value={this.state.newRegionLocus}
                        onChange={event => this.setState({newRegionLocus: event.target.value})}
                    />
                </label> <button className="btn btn-sm btn-success" onClick={this.addRegion}>Add new region</button>
                {this.state.newRegionError ? this.state.newRegionError.message : null}
            </div>

            {this.state.set &&
            <React.Fragment>
                <ReactTable
                filterable
                defaultPageSize={10}
                defaultFilterMethod={defaultFilterMethod}
                minRows={Math.min(features.length, 10)}
                data={features}
                columns={columns}
                className="-striped -highlight"
                />
                <FlankingStratConfig
                    strategy={this.state.set.flankingStrategy}
                    onNewStrategy={this.changeSetStrategy}
                />
                <div>
                <button className="btn btn-sm btn-primary"
                    onClick={() => this.props.onSetConfigured(this.state.set)}
                    disabled={this.isSaveButtonDisabled()}
                >
                    Save changes
                </button> <button className="btn btn-sm btn-secondary" onClick={this.cancelPressed}>Cancel</button>
                </div>
            </React.Fragment>
            }
        </div>
        );
    }
}

export default RegionSetConfig;
