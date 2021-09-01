import Fuse, { FuseOptions } from 'fuse.js';
import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactTable, { CellInfo, Column } from 'react-table';
import 'react-table/react-table.css';
import TrackModel from '../../model/TrackModel';
import { UNUSED_META_KEY } from './FacetTable';
import TrackSearchBox from './TrackSearchBox';

interface HubTrackTableProps {
	tracks?: TrackModel[];
	onTracksAdded: (tracks: TrackModel[]) => void;
	addedTrackSets: Set<number>;
	rowHeader: string;
	columnHeader: string;
}

/**
 * Table that displays tracks available from loaded hubs.
 *
 * @author Silas Hsu
 * @author Daofeng Li
 */

const HubTrackTable: React.FC<HubTrackTableProps> = ({ addedTrackSets, onTracksAdded, tracks: initTracks = [], columnHeader, rowHeader }) => {
	const reactTableRef = useRef<ReactTable<TrackModel> | null>(null);
	const [tracks, setTracks] = useState<TrackModel[]>([]); // stores tracks after perform fuse search
	const [fuse, setFuse] = useState<Fuse<TrackModel, FuseOptions<TrackModel>> | null>(null); // fuse instance
	const [option, setOption] = useState<FuseOptions<TrackModel> | null>(null); // fuse search option, see https://fusejs.io/
	const [searchText, setSearchText] = useState<string>('');

	useEffect(() => {
		const metaKeys = initTracks.map((tk) => Object.keys(tk.metadata));
		const uniqKeys = _.uniq(_.flatten(metaKeys));
		const keys = ['label', ...uniqKeys.filter((k) => k !== 'Track type').map((k) => `metadata.${k}`)];
		const option = {
			shouldSort: true,
			threshold: 0.4,
			location: 0,
			distance: 100,
			maxPatternLength: 32,
			minMatchCharLength: 2,
			keys
		};
		const fuse = new Fuse(initTracks, option);
		setFuse(fuse);
		setOption(option);
		setTracks([...initTracks]);
	}, [initTracks]);

	const handleSearchChange = useCallback(
		_.debounce((value: string) => {
			if (value.length > 0) {
				const result = fuse.search(value);
				setTracks(result as TrackModel[]);
				setSearchText(value);
			} else {
				setTracks([...initTracks]);
			}
		}, 250),
		[fuse, initTracks]
	);

	const handleSearchChangeRequest = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		const search = event.target.value.trim(); // remove white space
		handleSearchChange(search);
	}, []);

	/**
	 * Gets the cell under the "Add" column for a row.  There are two states - the track is added, or the track is not
	 * added, meaning there should be an add button.
	 *
	 * @param {Object} reactTableRow - a Row object that ReactTable provides
	 * @param {Set<number>} addedTrackUrls - set of tracks, to help determine if the track has been added already
	 * @return {JSX.Element} the cell to render
	 */
	const getAddTrackCell = useCallback(
		(reactTableRow: CellInfo, addedTrackUrls: Set<number>) => {
			if (!onTracksAdded) {
				return null;
			}
			let track = reactTableRow.original;
			if (addedTrackUrls.has(track.url) || addedTrackUrls.has(track.name)) {
				return <span>✓</span>;
			}

			return <button onClick={() => onTracksAdded([tracks[reactTableRow.index]])}>+</button>;
		},
		[onTracksAdded, tracks]
	);

	/**
	 * the button to add all tracks in current hub track table page
	 */
	const handleAddAll = useCallback(() => {
		const current = reactTableRef.current;
		if (current) {
			// @ts-ignore type errors are annoying and i have no idea why this code was written this way originally, so i don't want to touch it
			const page = current.state.page;
			// @ts-ignore type errors are annoying and i have no idea why this code was written this way originally, so i don't want to touch it
			const pageSize = current.state.pageSize;
			// @ts-ignore type errors are annoying and i have no idea why this code was written this way originally, so i don't want to touch it
			const allData = current.getResolvedState().sortedData;
			const startIdx = page * pageSize;
			// @ts-ignore type errors are annoying and i have no idea why this code was written this way originally, so i don't want to touch it
			const currentData = allData.slice(startIdx, startIdx + pageSize).map((item) => item._original);
			// @ts-ignore type errors are annoying and i have no idea why this code was written this way originally, so i don't want to touch it
			const availableTracks = currentData.filter((track: TrackModel) => !(addedTrackSets.has(track.url) || addedTrackSets.has(track.name)));
			if (availableTracks.length) {
				onTracksAdded(availableTracks);
			}
		}
	}, [addedTrackSets, onTracksAdded]);

	const renderAddAll = useCallback(() => {
		return (
			<div className="text-right">
				<button type="button" className="btn btn-primary btn-sm" onClick={handleAddAll}>
					Add all
				</button>
			</div>
		);
	}, [handleAddAll]);

	const defaultFilterMethod = useCallback((filter, row) => String(row[filter.id]).toLowerCase().includes(filter.value.toLowerCase()), []);

	let columns = useMemo<Column<TrackModel>[]>(
		() => [
			{
				Header: 'Genome',
				id: 'genome',
				accessor: (data) => data.getMetadata('genome'),
				width: 100
			},
			{
				Header: 'Name',
				accessor: 'name'
			},
			{
				Header: 'Data hub',
				accessor: 'datahub'
			}
		],
		[]
	);

	if (rowHeader !== UNUSED_META_KEY && rowHeader !== 'genome') {
		columns.push({
			Header: rowHeader,
			id: rowHeader.toLowerCase(),
			accessor: (data) => data.getMetadataAsArray(rowHeader).join(' > '),
			Filter: (cellInfo) => <TrackSearchBox tracks={tracks} metadataPropToSearch={rowHeader} onChange={cellInfo.onChange} />,
			headerStyle: { flex: '100 0 auto', overflow: 'visible' }
		});
	}
	if (columnHeader !== UNUSED_META_KEY && rowHeader !== 'genome') {
		columns.push({
			Header: columnHeader,
			id: columnHeader.toLowerCase(),
			accessor: (data) => data.getMetadataAsArray(columnHeader).join(' > '),
			Filter: (cellInfo) => <TrackSearchBox tracks={tracks} metadataPropToSearch={columnHeader} onChange={cellInfo.onChange} />,
			headerStyle: { flex: '100 0 auto', overflow: 'visible' }
		});
	}
	if (columnHeader === UNUSED_META_KEY || rowHeader === UNUSED_META_KEY) {
		columns.push({
			Header: 'URL',
			accessor: 'url',
			width: 200
		});
	}
	columns.push({
		Header: 'Format',
		accessor: 'type',
		width: 100
	});
	columns.push({
		Header: 'Add',
		Cell: (reactTableRow) => getAddTrackCell(reactTableRow, addedTrackSets),
		width: 50,
		filterable: false
	});

	return (
		<>
			<h1>Track table</h1>
			<label htmlFor="searchTrack">Search tracks</label>
			<input type="text" className="form-control" placeholder="H1 or H3K4me3, etc..." value={searchText} onChange={handleSearchChangeRequest} />
			<small id="searchTrackHelp" className="form-text text-muted">
				Free text search over track lables and metadata.
			</small>
			<br />
			{renderAddAll()}
			<ReactTable
				filterable
				defaultFilterMethod={defaultFilterMethod}
				data={tracks}
				columns={columns}
				className="-striped -highlight"
				ref={(r) => (reactTableRef.current = r)}
			/>
		</>
	);
};

export default HubTrackTable;
