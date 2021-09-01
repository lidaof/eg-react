import { GenomeConfig } from 'model/genomes/GenomeConfig';
import React, { useCallback, useEffect, useState } from 'react';
import { getGenomeConfig } from '../../model/genomes/allGenomes';
import TrackModel from '../../model/TrackModel';
import { getSecondaryGenomes } from '../../util';
import { AnnotationTrackSelector } from './AnnotationTrackSelector';

interface AnnotationTrackUIProps {
	genomeConfig: GenomeConfig;
	addedTracks: TrackModel[];
	onTracksAdded?: (trackModel: TrackModel) => void;
	addedTrackSets: Set<TrackModel>;
	groupedTrackSets: Record<string, Set<string>>;
}

/**
 * GUI for selecting annotation tracks to add based on genome.
 *
 * @author Daofeng Li
 */
export const AnnotationTrackUI: React.FC<AnnotationTrackUIProps> = ({ addedTrackSets, addedTracks, genomeConfig, groupedTrackSets, onTracksAdded = () => {} }) => {
	const [secondConfigs, setSecondConfigs] = useState<GenomeConfig[]>(
		getSecondaryGenomes(genomeConfig.genome.getName(), addedTracks).map((g) => getGenomeConfig(g))
	);

	useEffect(() => {
		setSecondConfigs(getSecondaryGenomes(genomeConfig.genome.getName(), addedTracks).map((g) => getGenomeConfig(g)));
	}, [addedTracks]);

	const renderSecondaryUI = useCallback(() => {
		return secondConfigs.map((config) =>
			config ? (
				<AnnotationTrackSelector
					key={config.genome.getName()}
					addedTracks={addedTracks}
					onTracksAdded={onTracksAdded}
					addedTrackSets={addedTrackSets}
					genomeConfig={config}
					addGenomeLabel={true}
					groupedTrackSets={groupedTrackSets}
				/>
			) : null
		);
	}, []);

	return (
		<>
			<AnnotationTrackSelector
				addedTracks={addedTracks}
				onTracksAdded={onTracksAdded}
				addedTrackSets={addedTrackSets}
				genomeConfig={genomeConfig}
				groupedTrackSets={groupedTrackSets}
			/>
			{renderSecondaryUI()}
		</>
	);
};
