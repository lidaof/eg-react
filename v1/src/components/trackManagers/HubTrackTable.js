import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from 'react-table'
import TrackModel from '../../model/TrackModel';
import TrackSearchBox from './TrackSearchBox';
import 'react-table/react-table.css';

/**
 * Table that displays tracks available from loaded hubs.
 * 
 * @author Silas Hsu
 */
class HubTrackTable extends React.PureComponent {
    static propTypes = {
        tracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)).isRequired,
        addedTracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)).isRequired,
        onTrackAdded: PropTypes.func,
    }

    static defaultProps = {
        tracks: [],
        addedTracks: [],
    }

    constructor(props) {
        super(props);
        this.getAddTrackCell = this.getAddTrackCell.bind(this);
    }

    /**
     * Gets the cell under the "Add" column for a row.  There are two states - the track is added, or the track is not
     * added, meaning there should be an add button.
     * 
     * @param {Object} reactTableRow - a Row object that ReactTable provides
     * @param {Set<TrackModel>} addedTrackSet - set of tracks, to help determine if the track has been added already
     * @return {React.Component} the cell to render
     */
    getAddTrackCell(reactTableRow, addedTrackSet) {
        if (!this.props.onTrackAdded) {
            return null;
        }
        let track = reactTableRow.original;
        if (addedTrackSet.has(track)) {
            return <span>✓</span>
        }

        return <button onClick={() => this.props.onTrackAdded(this.props.tracks[reactTableRow.index])}>+</button>
    }

    /**
     * @inheritdoc
     */
    render() {
        let addedTrackSet = new Set(this.props.addedTracks);
        let columns = [
            {
                Header: "Name",
                accessor: "name"
            },
            {
                Header: "Data hub",
                accessor: "datahub"
            },
            {
                Header: "Assay",
                id: "assay",
                accessor: data => data.metadata.Assay.join(' > '),
                Filter: (cellInfo) => 
                    <TrackSearchBox
                        tracks={this.props.tracks}
                        metadataPropToSearch={"Assay"}
                        onChange={cellInfo.onChange}
                    />,
                headerStyle: {flex: "100 0 auto", overflow: "visible"}
            },
            {
                Header: "Sample",
                id: "sample",
                accessor: data => data.metadata.Sample.join(' > '),
                Filter: (cellInfo) => 
                    <TrackSearchBox
                        tracks={this.props.tracks}
                        metadataPropToSearch={"Sample"}
                        onChange={cellInfo.onChange}
                    />,
                headerStyle: {flex: "100 0 auto", overflow: "visible"}
            },
            {
                Header: "Format",
                accessor: "type",
                width: 100
            },
            {
                Header: "Add",
                Cell: reactTableRow => this.getAddTrackCell(reactTableRow, addedTrackSet),
                width: 50,
                filterable: false
            }
        ];

        return (
        <ReactTable
            filterable
            defaultFilterMethod={(filter, row) =>
                String(row[filter.id]).toLowerCase().includes(filter.value.toLowerCase())
            }
            data={this.props.tracks}
            columns={columns}
        />
        );
    }
}

export default HubTrackTable;
