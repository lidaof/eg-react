import Gene from 'model/Gene';
import ChromosomeInterval from 'model/interval/ChromosomeInterval';
import NavigationContext from 'model/NavigationContext';
import React, { useCallback } from 'react';
import { notify } from 'react-notify-toast';
import GeneSearchBoxBase from './GeneSearchBoxBase';

interface GeneSearchBoxProps {
	navContext: NavigationContext; // The current navigation context
	/**
	 * Called when the user chooses a gene and wants to go to it in the nav context.  Signature:
	 *     (newStart: number, newEnd: number): void
	 *         `newStart`: the nav context coordinate of the start of the view interval
	 *         `newEnd`: the nav context coordinate of the end of the view interval
	 */
	onRegionSelected: (...interval: number[]) => void;
	handleCloseModal: () => void;
	onSetEnteredRegion: (gene: ChromosomeInterval) => void;
}

/**
 * A box that accepts gene name queries, and gives suggestions as well.
 *
 * @author Daofeng Li and Silas Hsu
 */
const GeneSearchBox: React.FC<GeneSearchBoxProps> = ({ handleCloseModal, navContext, onRegionSelected, onSetEnteredRegion }) => {
	/**
	 * @param {Gene} gene
	 */
	const setViewToGene = useCallback((gene: Gene) => {
		const interval = navContext.convertGenomeIntervalToBases(gene.getLocus())[0];
		if (interval) {
			onRegionSelected(...interval);
			handleCloseModal();
			onSetEnteredRegion(gene.getLocus());
		} else {
			notify.show('Gene not available in current region set view', 'error', 2000);
		}
	}, []);

	return <GeneSearchBoxBase onGeneSelected={setViewToGene} simpleMode={false} voiceInput={true} />;
};

export default GeneSearchBox;
