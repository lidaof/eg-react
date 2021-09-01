import axios from 'axios';
import { GenomeConfig } from 'model/genomes/GenomeConfig';
import React, { useEffect, useState } from 'react';
import { AWS_API } from '../../dataSources/GeneSource';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import Gene, { IdbRecord } from '../../model/Gene';
import LinearDrawingModel from '../../model/LinearDrawingModel';
import withCurrentGenome from '../withCurrentGenome';
import './IsoformSelection.css';
import { StandaloneGeneAnnotation } from './StandaloneGeneAnnotation';

const DRAW_WIDTH = 200;

interface IsoformSelectionProps {
	/**
	 * Genome config to use.  Needed because if genes are on different chromosomes, we need to know chromosome
	 * lengths to draw gene locations to scale.
	 */
	genomeConfig: GenomeConfig;
	geneName: string; // Gene name to query
	onGeneSelected: (gene: Gene) => void; // Callback for when a gene is selected.
	simpleMode: boolean;
}

/**
 * Isoform selection table.
 *
 * @author Silas Hsu
 */
const IsoformSelection: React.FC<IsoformSelectionProps> = ({ geneName = '', genomeConfig, onGeneSelected = () => undefined, simpleMode }) => {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [genes, setGenes] = useState<Gene[]>([]);

	useEffect(() => {
		(async () => {
			const genomeName = genomeConfig.genome.getName();
			// FIXME: stop accessing private property (add getter maybe?)
			// @ts-ignore we probably shouldn't do this but...
			const chrListObject = genomeConfig.navContext._featuresForChr;
			const params = {
				q: geneName,
				isExact: true
			};
			const response = await axios.get<IdbRecord[]>(`${AWS_API}/${genomeName}/genes/queryName`, { params: params });
			// filter out genes in super contigs in case those are not in chrom list
			const recordsInFeatures = response.data.filter((record) => chrListObject.hasOwnProperty(record.chrom));
			const genes = recordsInFeatures.map((record) => new Gene(record));
			setIsLoading(false);
			setGenes(genes);
		})();
	}, [geneName, genomeConfig]);

	const renderSuggestions = () => {
		const navContext = genomeConfig.navContext;
		const contextIntervals = genes.map((gene) => gene.computeNavContextCoordinates(navContext)[0]);
		const leftmostStart = Math.min(...contextIntervals.map((location) => location.start));
		const rightmostEnd = Math.max(...contextIntervals.map((location) => location.end));
		const viewRegion = new DisplayedRegionModel(navContext, leftmostStart, rightmostEnd);
		const drawModel = new LinearDrawingModel(viewRegion, DRAW_WIDTH);

		const renderOneSuggestion = (gene: Gene, i: number) => {
			return (
				<div key={gene.dbRecord._id} className="IsoformSelection-item" onClick={() => onGeneSelected(gene)}>
					<div className="IsoformSelection-collection">{gene.collection}</div>
					<div>{gene.getLocus().toString()}</div>
					<div>
						<StandaloneGeneAnnotation
							gene={gene}
							contextLocation={contextIntervals[i]}
							xSpan={drawModel.baseSpanToXSpan(contextIntervals[i])}
							elementWidth={DRAW_WIDTH}
						/>
					</div>
					<div className="IsoformSelection-description">{gene.description}</div>
				</div>
			);
		};

		return <div className="IsoformSelection">{genes.map(renderOneSuggestion)}</div>;
	};

	const renderSuggestionsSimple = () => {
		const navContext = genomeConfig.navContext;
		const contextIntervals = genes.map((gene) => gene.computeNavContextCoordinates(navContext)[0]);
		const leftmostStart = Math.min(...contextIntervals.map((location) => location.start));
		const rightmostEnd = Math.max(...contextIntervals.map((location) => location.end));
		const viewRegion = new DisplayedRegionModel(navContext, leftmostStart, rightmostEnd);
		const drawModel = new LinearDrawingModel(viewRegion, DRAW_WIDTH);

		const renderOneSuggestion = (gene: Gene, i: number) => {
			return (
				<div key={gene.dbRecord._id} className="IsoformSelection-item-simple" onClick={() => onGeneSelected(gene)}>
					<div>{gene.getLocus().toString()}</div>
					<div>
						<StandaloneGeneAnnotation
							gene={gene}
							contextLocation={contextIntervals[i]}
							xSpan={drawModel.baseSpanToXSpan(contextIntervals[i])}
							elementWidth={DRAW_WIDTH}
						/>
					</div>
				</div>
			);
		};

		return <div className="IsoformSelection">{genes.map(renderOneSuggestion)}</div>;
	};

	if (isLoading) {
		return <>Loading...</>;
	}

	if (genes.length === 0) {
		return <>Could not find gene {geneName}</>;
	}
	if (simpleMode) {
		return renderSuggestionsSimple();
	} else {
		return renderSuggestions();
	}
};

export default withCurrentGenome(IsoformSelection);
