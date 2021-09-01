import React from 'react';
import TrackModel from '../../model/TrackModel';
import FacetTable from './FacetTable';
import HubTable, { GeneAnnotationTrack } from './HubTable';

interface HubPaneProps {
	addedTracks: TrackModel[];
	publicTracksPool: TrackModel[];
	onTracksAdded: (tracks: TrackModel[]) => void;
	onAddTracksToPool: (tracks: TrackModel[], bool: boolean, url: string) => void;
	addTermToMetaSets: (keys: string[]) => void;
	onHubUpdated: (hubs: GeneAnnotationTrack[]) => void;
	addedTrackSets: Set<TrackModel>;
	publicTrackSets: Set<TrackModel>;
	publicHubs: GeneAnnotationTrack[];
}

/**
 * The window containing UI for loading public track hubs and adding tracks from hubs.
 *
 * @author Silas Hsu
 */
const HubPane: React.FC<HubPaneProps> = ({
	addTermToMetaSets,
	addedTrackSets,
	addedTracks,
	onAddTracksToPool,
	onTracksAdded,
	publicTrackSets,
	publicTracksPool,
	publicHubs,
	onHubUpdated
}) => {
	return (
		<div>
			<HubTable onHubLoaded={onAddTracksToPool} onTracksAdded={onTracksAdded} publicHubs={publicHubs} onHubUpdated={onHubUpdated} />
			{publicTracksPool.length > 0 ? (
				<FacetTable
					tracks={publicTracksPool} // need include add tracks, also need consider track remove to just remove from sets
					addedTracks={addedTracks}
					onTracksAdded={onTracksAdded}
					publicTrackSets={publicTrackSets}
					addedTrackSets={addedTrackSets}
					addTermToMetaSets={addTermToMetaSets}
				/>
			) : (
				<p>No tracks from data hubs yet. Load a hub first.</p>
			)}
		</div>
	);
};

export default HubPane;
