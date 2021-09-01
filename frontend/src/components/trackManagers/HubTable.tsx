import _ from 'lodash';
import { GenomeConfig } from 'model/genomes/GenomeConfig';
import TrackModel from 'model/TrackModel';
import React, { useCallback, useMemo } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import DataHubParser from '../../model/DataHubParser';
import Json5Fetcher from '../../model/Json5Fetcher';
import { ObjectAsTable } from '../trackContextMenu/TrackContextMenu';
import withCurrentGenome from '../withCurrentGenome';

export interface GeneAnnotationTrack {
	type: string;
	name: string;
	url: string;
	genome: string;
	oldHubFormat?: boolean;
}

interface HubTableProps {
	onHubLoaded?: (tracks: TrackModel[], bool: boolean, url: string) => void;
	onHubUpdated: (hubs: GeneAnnotationTrack[]) => void;
	onTracksAdded: (tracks: TrackModel[]) => void;
	publicHubs: GeneAnnotationTrack[];
	genomeConfig: GenomeConfig;
}

/**
 * Table that displays available public track hubs.
 *
 * @author Silas Hsu
 */
const HubTable: React.FC<HubTableProps> = ({ onHubLoaded, onHubUpdated, onTracksAdded, publicHubs, genomeConfig }) => {
	const hubParser = useMemo(() => new DataHubParser(), []);
	const columns = useMemo(
		() => [
			{
				Header: 'Genome',
				accessor: 'genome',
				width: 100
			},
			{
				Header: 'Collection',
				accessor: 'collection'
			},
			{
				Header: 'Hub name',
				accessor: 'name'
			},
			{
				Header: 'Tracks',
				accessor: 'numTracks',
				aggregate: (values: number[]) => _.sum(values),
				width: 100,
				filterable: false
			},
			{
				Header: 'Add',
				Cell: getAddHubCell,
				width: 100,
				filterable: false
			}
		],
		[]
	);

	/**
	 * Gets a copy of this table's hub list, except with one hub modified.
	 *
	 * @param {number} index - the index of the hub to modify in this.props.publicHubs
	 * @param {Partial<Hub>} propsToMerge - props to merge into the selected hub
	 * @return copy of this table's hub list, with one hub modified
	 */
	const cloneHubsAndModifyOne = useCallback(
		(index: number, propsToMerge: Partial<GeneAnnotationTrack & { isLoading: boolean; isLoaded: boolean; error: number }>) => {
			let hubs = publicHubs.slice();
			let hub = _.cloneDeep(hubs[index]);
			Object.assign(hub, propsToMerge);
			hubs[index] = hub;
			return hubs;
		},
		[]
	);

	/**
	 * Loads the tracks in a hub and passes them to the callback specified by this.props
	 *
	 * @param {number} index - the index of the hub in this.props.publicHubs
	 */
	const loadHub = useCallback(async (index) => {
		if (onHubLoaded) {
			const hub = publicHubs[index];
			let newHubs = cloneHubsAndModifyOne(index, { isLoading: true });
			onHubUpdated(newHubs);
			try {
				const json = await new Json5Fetcher().get(hub.url);
				const lastSlashIndex = hub.url.lastIndexOf('/');
				const hubBase = hub.url.substring(0, lastSlashIndex).trimRight();
				const tracksStartIndex = hub.oldHubFormat ? 1 : 0;
				const tracks = hubParser.getTracksInHub(json, hub.name, hub.genome, hub.oldHubFormat, tracksStartIndex, hubBase);
				onHubLoaded(tracks, true, hub.url);
				let loadedHubs = cloneHubsAndModifyOne(index, { isLoading: false, isLoaded: true });
				onHubUpdated(loadedHubs);
				const tracksToShow = tracks.filter((track) => track.showOnHubLoad);
				if (tracksToShow.length > 0) {
					onTracksAdded(tracksToShow);
				}
			} catch (error) {
				console.error(error);
				let loadedHubs = cloneHubsAndModifyOne(index, { error: 1, isLoading: false });
				onHubUpdated(loadedHubs);
			}
		}
	}, []);

	/**
	 * Gets the cell under the "Add" column for a row.  There are three possible states - not loaded (so there should
	 * be a button to initiate loading), loading, and loaded.
	 *
	 * @param {Object} reactTableRow - a Row object that ReactTable provides
	 * @return {JSX.Element} the cell to render
	 */
	const getAddHubCell = useCallback((reactTableRow) => {
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

		return <button onClick={() => loadHub(reactTableRow.index)}>+</button>;
	}, []);

	return (
		<div>
			<h1>Public data hubs</h1>
			<ReactTable
				filterable
				defaultPageSize={10}
				data={publicHubs}
				columns={columns}
				minRows={Math.min(publicHubs.length, 10)}
				SubComponent={(row) => {
					let genome = row.original.genome;
					let collectionDetails = genomeConfig.publicHubData[row.original.collection] || <i>No details available.</i>;
					let hubDetails = row.original.description ? <ObjectAsTable content={row.original.description} /> : <i>No description available.</i>;
					return (
						<div style={{ padding: '20px' }}>
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
};

export default withCurrentGenome(HubTable);
