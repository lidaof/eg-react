import { GenomeConfig } from 'model/genomes/GenomeConfig';
import React, { useCallback, useRef, useState } from 'react';
import TrackModel from '../../model/TrackModel';
import TreeView from './TreeView';

interface JSONSchema {
	isExpanded: boolean;
	label: string;
	children: (JSONSchema | TrackModel)[];
}

/**
 *
 * @param {Object} schemaNode - object from
 * @param {string} nodeLabel - what to
 */
function convertAnnotationJsonSchema(schemaNode: TrackModel, nodeLabel: string): JSONSchema | TrackModel {
	if (!schemaNode) {
		return {
			isExpanded: false,
			label: nodeLabel,
			children: []
		};
	}

	const isLeaf = schemaNode.hasOwnProperty('name');
	if (isLeaf) {
		// TreeView will pass this object to our custom leaf renderer.
		return new TrackModel(schemaNode);
	}

	let children = [];
	for (let propName of Object.getOwnPropertyNames(schemaNode)) {
		let propValue = schemaNode[propName];
		if (typeof propValue === 'object') {
			children.push(convertAnnotationJsonSchema(propValue, propName));
		}
	}
	return {
		isExpanded: false,
		label: nodeLabel,
		children
	};
}

interface AnnotationTrackSelectorProps {
	genomeConfig: GenomeConfig;
	addedTracks: TrackModel[];
	onTracksAdded: (trackModel: TrackModel) => void;
	addedTrackSets: Set<TrackModel>;
	addGenomeLabel?: boolean;
	groupedTrackSets: Record<string, Set<string>>;
}

/**
 * GUI for selecting annotation tracks to add.
 *
 * @author Silas Hsu
 */
export const AnnotationTrackSelector: React.FC<AnnotationTrackSelectorProps> = ({
	addedTrackSets,
	groupedTrackSets,
	addedTracks,
	addGenomeLabel = false,
	genomeConfig: { genome, annotationTracks },
	onTracksAdded = () => {}
}) => {
	const dataRef = useRef<JSONSchema>(convertAnnotationJsonSchema(annotationTracks, genome.getName()) as JSONSchema);
	// React magic to force an update on the component
	const [_, __] = useState<any>({});

	const forceUpdate = useCallback(() => {
		__({});
	}, []);

	const nodeToggled = useCallback((node: JSONSchema) => {
		node.isExpanded = !node.isExpanded;
		forceUpdate();
	}, []);

	const addLeafTrack = useCallback(
		(trackModel) => {
			const genomeName = genome.getName();
			const label = addGenomeLabel ? `${trackModel.label} (${genomeName})` : trackModel.label;
			trackModel.label = label; // fix the problem when refresh added genome label is gone
			trackModel.options = { ...trackModel.options, label };
			trackModel.metadata = { ...trackModel.metadata, genome: genomeName };
			onTracksAdded(trackModel);
		},
		[genome, addGenomeLabel, onTracksAdded]
	);

	const renderLeaf = useCallback((trackModel: TrackModel) => {
		const genomeName = genome.getName();
		if (groupedTrackSets[genomeName]) {
			if (groupedTrackSets[genomeName].has(trackModel.name) || groupedTrackSets[genomeName].has(trackModel.url)) {
				return <div>{trackModel.label} (Added)</div>;
			}
		}
		if (addGenomeLabel && trackModel.querygenome) {
			return <div>{trackModel.label} (Can only be added to primary genome)</div>;
		}
		return (
			<div>
				{trackModel.label}{' '}
				<button onClick={() => addLeafTrack(trackModel)} className="btn btn-sm btn-success dense-button">
					Add
				</button>
			</div>
		);
	}, []);

	return <TreeView data={dataRef.current} onNodeToggled={nodeToggled} leafRenderer={renderLeaf} />;
};
