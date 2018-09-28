import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from "react-table";
import "react-table/react-table.css";
import TrackModel from '../../model/TrackModel';

/**
 * A complete list of tracks
 * 
 */

/**
 * All the UI for managing tracks: adding them, deleting them, looking at what tracks are available, etc.
 * 
 * @author Daofeng modified from Silas Hsu's TrackManager
 */
class TrackList extends React.Component {
    static propTypes = {
        addedTracks: PropTypes.arrayOf(PropTypes.object),
        onTracksAdded: PropTypes.func,
        onTrackRemoved: PropTypes.func,
        addedTrackSets: PropTypes.instanceOf(Set),
        addTracktoAvailable: PropTypes.func,
        removeTrackFromAvailable: PropTypes.func,
    };

    static defaultProps = {
        onTracksAdded: () => undefined,
        onTrackRemoved: () => undefined,
    };

    constructor(props) {
        super(props);
        this.getRemoveTrackCell = this.getRemoveTrackCell.bind(this);
        this.removeTrack = this.removeTrack.bind(this);
        this.getAddTrackCell = this.getAddTrackCell.bind(this);
        this.addTrack = this.addTrack.bind(this);
    }

    removeTrack(reactTableRow) {
        this.props.onTrackRemoved(reactTableRow.index);
        const track = reactTableRow.original;
        this.props.addTracktoAvailable(track);
    }

    getRemoveTrackCell(reactTableRow) {
        if (!this.props.onTrackRemoved) {
            return null;
        }
        return <button 
                    onClick={() => this.removeTrack(reactTableRow)}
                    className="btn btn-sm btn-danger"
                >✘</button>;
    }

    addTrack(reactTableRow) {
        const track = reactTableRow.original;
        this.props.removeTrackFromAvailable(track);
        this.props.onTracksAdded(TrackModel.deserialize(track.serialize()));
    }

    getAddTrackCell(reactTableRow) {
        if (!this.props.onTracksAdded) {
            return null;
        }
        return <button 
                onClick={() => this.addTrack(reactTableRow)}
                className="btn btn-sm btn-success"
                >+</button>;
    }
   
    /**
     * 
     * @return {JSX.Element} the element to render
     * @override
     */
    render() {
        const columnsForRemove = [
            {
                Header: "Label",
                accessor: "label",
            },
            {
                Header: "Track type",
                accessor: "type",
            },
            {
                Header: "Remove",
                Cell: reactTableRow => this.getRemoveTrackCell(reactTableRow),
                width: 50,
                filterable: false
            }
        ];
        const columnsForAdd = [
            {
                Header: "Label",
                accessor: "label",
            },
            {
                Header: "Track type",
                accessor: "type",
            },
            {
                Header: "Add",
                Cell: reactTableRow => this.getAddTrackCell(reactTableRow),
                width: 50,
                filterable: false
            }
        ];
        const {addedTracks, availableTrackSets} = this.props;
        const availTracks = Array.from(availableTrackSets);
        return (
            <React.Fragment>
            <h3>Displayed tracks</h3>
            <ReactTable
                filterable
                defaultPageSize={10}
                minRows={Math.min(addedTracks.length, 10)}
                defaultFilterMethod={(filter, row) =>
                    String(row[filter.id]).toLowerCase().includes(filter.value.toLowerCase())
                }
                data={addedTracks}
                columns={columnsForRemove}
                className="-striped -highlight"
            />
            {
                availTracks.length > 0 &&
                <React.Fragment>
                    <h3 style={{marginTop: "10px"}}>Available tracks</h3>
                    <ReactTable
                        filterable
                        defaultPageSize={10}
                        minRows={Math.min(availTracks.length, 10)}
                        defaultFilterMethod={(filter, row) =>
                            String(row[filter.id]).toLowerCase().includes(filter.value.toLowerCase())
                        }
                        data={availTracks}
                        columns={columnsForAdd}
                        className="-striped -highlight"
                    />
                </React.Fragment>
            }
        </React.Fragment>);
    }
}

export default TrackList;
