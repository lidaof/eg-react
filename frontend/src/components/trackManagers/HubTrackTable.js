import PropTypes from "prop-types";
import React from "react";
import ReactTable from "react-table";
import TrackModel from "../../model/TrackModel";
import TrackSearchBox from "./TrackSearchBox";
import "react-table/react-table.css";
import { UNUSED_META_KEY } from "./FacetTable";
import Fuse from "fuse.js";
import _ from "lodash";

/**
 * Table that displays tracks available from loaded hubs.
 *
 * @author Silas Hsu
 * @author Daofeng Li
 */

class HubTrackTable extends React.PureComponent {
    static propTypes = {
        tracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)).isRequired,
        onTracksAdded: PropTypes.func,
        addedTrackSets: PropTypes.instanceOf(Set),
    };

    static defaultProps = {
        tracks: [],
    };

    constructor(props) {
        super(props);
        this.getAddTrackCell = this.getAddTrackCell.bind(this);
        this.state = {
            tracks: [], // stores tracks after perform fuse search
            fuse: null, // fuse instance
            option: null, // fuse search option, see https://fusejs.io/
            searchText: "",
        };
        this.handleSearchChange = _.debounce(this.handleSearchChange.bind(this), 250);
    }

    componentDidMount() {
        const metaKeys = this.props.tracks.map((tk) => Object.keys(tk.metadata));
        const uniqKeys = _.uniq(_.flatten(metaKeys));
        const keys = ["label", ...uniqKeys.filter((k) => k !== "Track type").map((k) => `metadata.${k}`)];
        const option = {
            shouldSort: true,
            threshold: 0.4,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 2,
            keys,
        };
        const fuse = new Fuse(this.props.tracks, option);
        this.setState({ fuse, option, tracks: [...this.props.tracks] });
    }

    handleSearchChange = (value) => {
        if (value.length > 0) {
            const result = this.state.fuse.search(value);
            this.setState({ tracks: result, searchText: value });
        } else {
            this.setState({ tracks: [...this.props.tracks] });
        }
    };

    handleSearchChangeRequest = (event) => {
        const search = event.target.value.trim(); // remove white space
        this.handleSearchChange(search);
    };

    /**
     * Gets the cell under the "Add" column for a row.  There are two states - the track is added, or the track is not
     * added, meaning there should be an add button.
     *
     * @param {Object} reactTableRow - a Row object that ReactTable provides
     * @param {Set<number>} addedTrackUrls - set of tracks, to help determine if the track has been added already
     * @return {JSX.Element} the cell to render
     */
    getAddTrackCell(reactTableRow, addedTrackUrls) {
        if (!this.props.onTracksAdded) {
            return null;
        }
        let track = reactTableRow.original;
        if (addedTrackUrls.has(track.url) || addedTrackUrls.has(track.name)) {
            return <span>✓</span>;
        }

        return <button onClick={() => this.props.onTracksAdded([this.state.tracks[reactTableRow.index]])}>+</button>;
    }

    renderAddAll = () => {
        return (
            <div className="text-right">
                <button type="button" className="btn btn-primary btn-sm" onClick={this.handleAddAll}>
                    Add all
                </button>
            </div>
        );
    };
    /**
     * the button to add all tracks in current hub track table page
     */
    handleAddAll = () => {
        const { addedTrackSets, onTracksAdded } = this.props;
        const current = this.reactTable;
        if (current) {
            const page = current.state.page;
            const pageSize = current.state.pageSize;
            const allData = current.getResolvedState().sortedData;
            const startIdx = page * pageSize;
            const currentData = allData.slice(startIdx, startIdx + pageSize).map((item) => item._original);
            const availableTracks = currentData.filter(
                (track) => !(addedTrackSets.has(track.url) || addedTrackSets.has(track.name))
            );
            if (availableTracks.length) {
                onTracksAdded(availableTracks);
            }
        }
    };

    /**
     * @inheritdoc
     */
    render() {
        const defaultFilterMethod = (filter, row) =>
            String(row[filter.id]).toLowerCase().includes(filter.value.toLowerCase());

        const { rowHeader, columnHeader } = this.props;
        let columns = [];
        columns.push({
            Header: "Genome",
            id: "genome",
            accessor: (data) => data.getMetadata("genome"),
            width: 100,
        });
        columns.push({
            Header: "Name",
            accessor: "name",
        });
        columns.push({
            Header: "Data hub",
            accessor: "datahub",
        });
        if (rowHeader !== UNUSED_META_KEY && rowHeader !== "genome") {
            columns.push({
                Header: rowHeader,
                id: rowHeader.toLowerCase(),
                accessor: (data) => data.getMetadataAsArray(rowHeader).join(" > "),
                Filter: (cellInfo) => (
                    <TrackSearchBox
                        tracks={this.state.tracks}
                        metadataPropToSearch={rowHeader}
                        onChange={cellInfo.onChange}
                    />
                ),
                headerStyle: { flex: "100 0 auto", overflow: "visible" },
            });
        }
        if (columnHeader !== UNUSED_META_KEY && rowHeader !== "genome") {
            columns.push({
                Header: columnHeader,
                id: columnHeader.toLowerCase(),
                accessor: (data) => data.getMetadataAsArray(columnHeader).join(" > "),
                Filter: (cellInfo) => (
                    <TrackSearchBox
                        tracks={this.state.tracks}
                        metadataPropToSearch={columnHeader}
                        onChange={cellInfo.onChange}
                    />
                ),
                headerStyle: { flex: "100 0 auto", overflow: "visible" },
            });
        }
        if (columnHeader === UNUSED_META_KEY || rowHeader === UNUSED_META_KEY) {
            columns.push({
                Header: "URL",
                accessor: "url",
                width: 200,
            });
        }
        columns.push({
            Header: "Format",
            accessor: "type",
            width: 100,
        });
        columns.push({
            Header: "Add",
            Cell: (reactTableRow) => this.getAddTrackCell(reactTableRow, this.props.addedTrackSets),
            width: 50,
            filterable: false,
        });
        return (
            <React.Fragment>
                <h1>Track table</h1>
                <label htmlFor="searchTrack">Search tracks</label>
                <input
                    type="text"
                    className="form-control"
                    placeholder="H1 or H3K4me3, etc..."
                    value={this.state.searchValue}
                    onChange={this.handleSearchChangeRequest}
                />
                <small id="searchTrackHelp" className="form-text text-muted">
                    Free text search over track lables and metadata.
                </small>
                <br />
                {this.renderAddAll()}
                <ReactTable
                    filterable
                    defaultFilterMethod={defaultFilterMethod}
                    data={this.state.tracks}
                    columns={columns}
                    className="-striped -highlight"
                    ref={(r) => (this.reactTable = r)}
                />
            </React.Fragment>
        );
    }
}

export default HubTrackTable;
