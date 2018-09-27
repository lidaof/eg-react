import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from 'react-table'
import TrackModel from '../../model/TrackModel';
import TrackSearchBox from './TrackSearchBox';
import 'react-table/react-table.css';
import { UNUSED_META_KEY } from "./FacetTable";

/**
 * Table that displays tracks available from loaded hubs.
 * 
 * @author Silas Hsu
 */
class HubTrackTable extends React.PureComponent {
    static propTypes = {
        tracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)).isRequired,
        onTrackAdded: PropTypes.func,
        addedTrackSets: PropTypes.instanceOf(Set),
    }

    static defaultProps = {
        tracks: [],
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
     * @param {Set<number>} addedTrackUrls - set of tracks, to help determine if the track has been added already
     * @return {JSX.Element} the cell to render
     */
    getAddTrackCell(reactTableRow, addedTrackUrls) {
        if (!this.props.onTrackAdded) {
            return null;
        }
        let track = reactTableRow.original;
        if (addedTrackUrls.has(track.url)) {
            return <span>✓</span>;
        }

        return <button onClick={() => this.props.onTrackAdded(this.props.tracks[reactTableRow.index])}>+</button>;
    }

    /**
     * @inheritdoc
     */
    render() {
        const defaultFilterMethod = (filter, row) =>
        String(row[filter.id]).toLowerCase().includes(filter.value.toLowerCase());

        const {rowHeader, columnHeader} = this.props;
        let columns = [];
        columns.push(
            {
                Header: "Name",
                accessor: "name"
            }
        );
        columns.push(
            {
                Header: "Data hub",
                accessor: "datahub"
            }
        );
        if (rowHeader !== UNUSED_META_KEY){
            columns.push(
                {
                    Header: rowHeader,
                    id: rowHeader.toLowerCase(),
                    accessor: data => Array.isArray(data.metadata[rowHeader]) ? data.metadata[rowHeader].join(' > ') : data.metadata[rowHeader],
                    Filter: (cellInfo) => 
                        <TrackSearchBox
                            tracks={this.props.tracks}
                            metadataPropToSearch={rowHeader}
                            onChange={cellInfo.onChange}
                        />,
                    headerStyle: {flex: "100 0 auto", overflow: "visible"}
                }
            );
        }
        if(columnHeader !== UNUSED_META_KEY){
            columns.push(
                {
                    Header: columnHeader,
                    id: columnHeader.toLowerCase(),
                    accessor: data => Array.isArray(data.metadata[columnHeader]) ? data.metadata[columnHeader].join(' > ') : data.metadata[columnHeader],
                    Filter: (cellInfo) => 
                        <TrackSearchBox
                            tracks={this.props.tracks}
                            metadataPropToSearch={columnHeader}
                            onChange={cellInfo.onChange}
                        /> ,
                    headerStyle: {flex: "100 0 auto", overflow: "visible"}
                }
            );
        }
        if(columnHeader === UNUSED_META_KEY || rowHeader === UNUSED_META_KEY) {
            columns.push(
                {
                    Header: "URL",
                    accessor: "url",
                    width: 200
                }
            ); 
        }
        columns.push(
            {
                Header: "Format",
                accessor: "type",
                width: 100
            }
        );
        columns.push(
            {
                Header: "Add",
                Cell: reactTableRow => this.getAddTrackCell(reactTableRow, this.props.addedTrackSets),
                width: 50,
                filterable: false
            }
        );
            
        

        return (
            <React.Fragment>
                <h1>Track table</h1>
                <ReactTable
                    filterable
                    defaultFilterMethod={defaultFilterMethod}
                    data={this.props.tracks}
                    columns={columns}
                    className="-striped -highlight"
                />
            </React.Fragment>
        
        );
    }
}

export default HubTrackTable;
