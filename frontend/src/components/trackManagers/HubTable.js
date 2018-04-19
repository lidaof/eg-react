
import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import ReactTable from "react-table";
import DataHubParser from '../../model/DataHubParser';

import "react-table/react-table.css";

const collectionData = {
    "Encyclopedia of DNA Elements (ENCODE)": "The Encyclopedia of DNA Elements (ENCODE) Consortium is an " +
        "international collaboration of research groups funded by the National Human Genome Research Institute " +
        "(NHGRI). The goal of ENCODE is to build a comprehensive parts list of functional elements in the human " +
        "genome, including elements that act at the protein and RNA levels, and regulatory elements that control " +
        "cells and circumstances in which a gene is active.",
    "Reference human epigenomes from Roadmap Epigenomics Consortium": "The NIH Roadmap Epigenomics Mapping Consortium was launched with the goal of producing a public resource of human epigenomic data to catalyze basic biology and disease-oriented research. The Consortium leverages experimental pipelines built around next-generation sequencing technologies to map DNA methylation, histone modifications, chromatin accessibility and small RNA transcripts in stem cells and primary ex vivo tissues selected to represent the normal counterparts of tissues and organ systems frequently involved in human disease (quoted from Roadmap website)."
}

const initialHubs = [
    {
        collection: "Encyclopedia of DNA Elements (ENCODE)",
        name: "ENCODE signal of unique reads",
        numTracks: 7729,
        url: "http://vizhub.wustl.edu/public/hg19/hg19_mpssur.json"
    },
    {
        collection: "Encyclopedia of DNA Elements (ENCODE)",
        name: "ENCODE signal of all reads",
        numTracks: 7842,
        url: "http://vizhub.wustl.edu/public/hg19/hg19_mpssar.json"
    },
    {
        collection: "Encyclopedia of DNA Elements (ENCODE)",
        name: "ENCODE all other types",
        numTracks: 5937,
        description: "Base overlap signal, fold change over control, genome compartments, percentage normalized signal, etc.",
        url: "http://vizhub.wustl.edu/public/hg19/hg19_other_rmdup.json"
    },
    {
        collection: "Encyclopedia of DNA Elements (ENCODE)",
        name: "ENCODE legacy hub",
        numTracks: 4251,
        url: "http://vizhub.wustl.edu/public/hg19/encode.md"
    },
    {
        collection: "Long-range chromatin interaction experiments",
        name: "Long-range chromatin interaction experiments",
        numTracks: 156,
        url: "http://vizhub.wustl.edu/public/hg19/longrange4"
    },
    {
        collection: "Reference human epigenomes from Roadmap Epigenomics Consortium",
        name: "Roadmap Data from GEO",
        numTracks: 2737,
        url: "http://vizhub.wustl.edu/public/hg19/roadmap9_methylC.md",
    },
    {
        collection: "Reference human epigenomes from Roadmap Epigenomics Consortium",
        name: "methylCRF tracks from Roadmap",
        numTracks: 16,
        description: "Single CpG methylation value prediction by methylCRF algorithm (PMID:23804401) using Roadmap data.",
        url: "http://vizhub.wustl.edu/public/hg19/methylCRF.roadmap.hub"
    },
    {
        collection: "HiC interaction from Juicebox",
        name: "HiC interaction from Juicebox",
        numTracks: 193,
        url: "http://epgg-test.wustl.edu/dli/long-range-test/hg19-juiceboxhub"
    },
    {
        collection: "Human 450K and 27K array data from TCGA",
        name: "Human 450K and 27K array data from TCGA",
        numTracks: 2551,
        url: "http://vizhub.wustl.edu/public/hg19/TCGA-450k-hub2"
    },
];

/**
 * Table that displays available public track hubs.
 * 
 * @author Silas Hsu
 */
class HubTable extends React.PureComponent {
    static propTypes = {
        onHubLoaded: PropTypes.func,
    }

    constructor(props) {
        super(props);
        this.hubParser = new DataHubParser();
        this.state = {
            hubs: initialHubs.slice()
        };
        this.loadHub = this.loadHub.bind(this);
        this.getAddHubCell = this.getAddHubCell.bind(this);

        this.columns = [
            {
                Header: "Collection",
                accessor: "collection"
            },
            {
                Header: "Hub name",
                accessor: "name"
            },
            {
                Header: "Tracks",
                accessor: "numTracks",
                aggregate: (values, rows) => _.sum(values),
                width: 100,
                filterable: false
            },
            {
                Header: "Add",
                Cell: this.getAddHubCell,
                width: 100,
                filterable: false,
            }
        ];
    }

    /**
     * Gets a copy of this table's hub list, except with one hub modified.
     * 
     * @param {number} index - the index of the hub to modify in this.state.hubs
     * @param {Partial<Hub>} propsToMerge - props to merge into the selected hub
     * @return copy of this table's hub list, with one hub modified
     */
    _cloneHubsAndModifyOne(index, propsToMerge) {
        let hubs = this.state.hubs.slice();
        let hub = _.cloneDeep(hubs[index]);
        Object.assign(hub, propsToMerge);
        hubs[index] = hub;
        return hubs;
    }

    /**
     * Loads the tracks in a hub and passes them to the callback specified by this.props
     * 
     * @param {number} index - the index of the hub in this.state.hubs
     */
    loadHub(index) {
        if (this.props.onHubLoaded) {
            let newHubs = this._cloneHubsAndModifyOne(index, {isLoading: true});
            this.setState({hubs: newHubs});
            this.hubParser.getTracksInHub(newHubs[index]).then(tracks => {
                this.props.onHubLoaded(tracks);
                let loadedHubs = this._cloneHubsAndModifyOne(index, {isLoading: false, isLoaded: true});
                this.setState({hubs: loadedHubs});
            });
        }
    }

    /**
     * Gets the cell under the "Add" column for a row.  There are three possible states - not loaded (so there should
     * be a button to initiate loading), loading, and loaded.
     * 
     * @param {Object} reactTableRow - a Row object that ReactTable provides
     * @return {JSX.Element} the cell to render
     */
    getAddHubCell(reactTableRow) {
        let hub = reactTableRow.original;
        if (hub.isLoaded) {
            return <span>✓</span>
        }

        if (hub.isLoading) {
            return <span>Loading...</span>
        }

        return <button onClick={() => this.loadHub(reactTableRow.index)}>+</button>
    }

    /**
     * @inheritdoc
     */
    render() {
        return <ReactTable
            filterable
            defaultPageSize={10}
            data={this.state.hubs}
            columns={this.columns}
            SubComponent={row => {
                let collectionDetails = collectionData[row.original.collection] || <i>No data available.</i>;
                let hubDetails = row.original.description || <i>No data available.</i>
                return (
                    <div style={{padding: "20px"}}>
                        <h3>Collection details</h3>
                        {collectionDetails}
                        <h3>Hub details</h3>
                        {hubDetails}
                    </div>
                );
            }}
            collapseOnSortingChange={false}
        />
    }
}

export default HubTable;
