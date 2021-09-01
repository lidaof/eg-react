import TrackModel from 'model/TrackModel';
import React, { useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap-tabs';
import FacetTable from './trackManagers/FacetTable';

interface FacetTableUIProps {
	publicTracksPool: TrackModel[];
	customTracksPool: TrackModel[];
	addedTracks: TrackModel[];
	onTracksAdded: (tracks: TrackModel[]) => void;
	addedTrackSets: Set<TrackModel>;
	addTermToMetaSets: (terms: string[]) => void;
}

const FacetTableUI: React.FC<FacetTableUIProps> = ({ addTermToMetaSets, addedTrackSets, addedTracks, customTracksPool, onTracksAdded, publicTracksPool }) => {
	const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);

	return (
		<Tabs
			onSelect={(index) => setSelectedTabIndex(index)}
			selected={selectedTabIndex}
			headerStyle={{ fontWeight: 'bold' }}
			activeHeaderStyle={{ color: 'blue' }}>
			<Tab label="Public tracks facet table">
				<h1>Tracks from public hubs</h1>
				{publicTracksPool.length > 0 ? (
					<FacetTable
						tracks={publicTracksPool}
						addedTracks={addedTracks}
						onTracksAdded={onTracksAdded}
						addedTrackSets={addedTrackSets}
						addTermToMetaSets={addTermToMetaSets}
					/>
				) : (
					<p>No public tracks from data hubs yet. Load a hub first.</p>
				)}
			</Tab>
			<Tab label="Custom tracks facet table">
				<h1>Tracks from custom track or hubs</h1>
				{customTracksPool.length > 0 ? (
					<FacetTable
						tracks={customTracksPool}
						addedTracks={addedTracks}
						onTracksAdded={onTracksAdded}
						addedTrackSets={addedTrackSets}
						addTermToMetaSets={addTermToMetaSets}
					/>
				) : (
					<p>No custom tracks yet. Submit custom tracks or load custom data hub.</p>
				)}
			</Tab>
		</Tabs>
	);
};

export default FacetTableUI;
