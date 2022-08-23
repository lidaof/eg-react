import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import ReactTable from "react-table";
import Json5Fetcher from "../../model/Json5Fetcher";
import DataHubParser from "../../model/DataHubParser";
import { ObjectAsTable } from "../trackContextMenu/TrackContextMenu";

import "react-table/react-table.css";

/**
 * Table that displays available public track hubs.
 *
 * @author Silas Hsu
 */
class HubTable extends React.PureComponent {
    static propTypes = {
        onHubLoaded: PropTypes.func,
        onHubUpdated: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.hubParser = new DataHubParser(1);
        this.loadHub = this.loadHub.bind(this);
        this.getAddHubCell = this.getAddHubCell.bind(this);

        this.columns = [
            {
                Header: "Genome",
                accessor: "genome",
                width: 100,
            },
            {
                Header: "Collection",
                accessor: "collection",
            },
            {
                Header: "Hub name",
                accessor: "name",
            },
            {
                Header: "Tracks",
                accessor: "numTracks",
                aggregate: (values, rows) => _.sum(values),
                width: 100,
                filterable: false,
            },
            {
                Header: "Add",
                Cell: this.getAddHubCell,
                width: 100,
                filterable: false,
            },
        ];
    }

    /**
     * Gets a copy of this table's hub list, except with one hub modified.
     *
     * @param {number} index - the index of the hub to modify in this.props.publicHubs
     * @param {Partial<Hub>} propsToMerge - props to merge into the selected hub
     * @return copy of this table's hub list, with one hub modified
     */
    _cloneHubsAndModifyOne(index, propsToMerge) {
        let hubs = this.props.publicHubs.slice();
        let hub = _.cloneDeep(hubs[index]);
        Object.assign(hub, propsToMerge);
        hubs[index] = hub;
        return hubs;
    }

    /**
     * Loads the tracks in a hub and passes them to the callback specified by this.props
     *
     * @param {number} index - the index of the hub in this.props.publicHubs
     */
    async loadHub(index) {
        if (this.props.onHubLoaded) {
            const hub = this.props.publicHubs[index];
            let newHubs = this._cloneHubsAndModifyOne(index, { isLoading: true });
            this.props.onHubUpdated(newHubs);
            try {
                const json = await new Json5Fetcher().get(hub.url);
                const lastSlashIndex = hub.url.lastIndexOf("/");
                const hubBase = hub.url.substring(0, lastSlashIndex).trimRight("/");
                const tracksStartIndex = hub.oldHubFormat ? 1 : 0;
                const tracks = await this.hubParser.getTracksInHub(
                    json,
                    hub.name,
                    hub.genome,
                    hub.oldHubFormat,
                    tracksStartIndex,
                    hubBase
                );
                this.props.onHubLoaded(tracks, true, hub.url);
                let loadedHubs = this._cloneHubsAndModifyOne(index, { isLoading: false, isLoaded: true });
                this.props.onHubUpdated(loadedHubs);
                const tracksToShow = tracks.filter((track) => track.showOnHubLoad);
                if (tracksToShow.length > 0) {
                    this.props.onTracksAdded(tracksToShow);
                }
            } catch (error) {
                console.error(error);
                let loadedHubs = this._cloneHubsAndModifyOne(index, { error: 1, isLoading: false });
                this.props.onHubUpdated(loadedHubs);
            }
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
            return <span>✓</span>;
        }
        if (hub.error) {
            return <span>Error</span>;
        }
        if (hub.isLoading) {
            return <span>Loading...</span>;
        }

        return <button onClick={() => this.loadHub(reactTableRow.index)}>+</button>;
    }

    /**
     * @inheritdoc
     */
    render() {
        const { publicHubData } = this.props.genomeConfig;
        return (
            <div>
                <ReactTable
                    filterable
                    defaultFilterMethod={(filter, row) =>
                        String(row[filter.id]).toLowerCase().includes(filter.value.toLowerCase())
                    }
                    defaultPageSize={10}
                    data={this.props.publicHubs}
                    columns={this.columns}
                    minRows={Math.min(this.props.publicHubs.length, 10)}
                    SubComponent={(row) => {
                        let genome = row.original.genome;
                        let collectionDetails = publicHubData[row.original.collection] || <i>No details available.</i>;
                        let hubDetails = row.original.description ? (
                            <ObjectAsTable content={row.original.description} />
                        ) : (
                            <i>No description available.</i>
                        );
                        return (
                            <div style={{ padding: "20px" }}>
                                <h3>Genome</h3>
                                {genome}
                                <h3>Collection details</h3>
                                {collectionDetails}
                                <h3>Hub details</h3>
                                {hubDetails}
                            </div>
                        );
                    }}
                    collapseOnSortingChange={false}
                    className="-striped -highlight"
                />
            </div>
        );
    }
}

export default HubTable;
