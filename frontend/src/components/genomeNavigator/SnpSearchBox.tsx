import axios from 'axios';
import _ from 'lodash';
import { GenomeConfig } from 'model/genomes/GenomeConfig';
import React, { useCallback, useState } from 'react';
import { notify } from 'react-notify-toast';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';
import NavigationContext from '../../model/NavigationContext';
import withCurrentGenome from '../withCurrentGenome';

const DEBOUNCE_INTERVAL = 250;
/**
 * Ensembl uses a one-based coordinate system, whereas UCSC uses a zero-based coordinate system.
 * https://useast.ensembl.org/Help/Faq?id=286
 */
const SNP_ENDPOINTS = {
	hg19: 'https://grch37.rest.ensembl.org/variation/human',
	hg38: 'https://rest.ensembl.org/variation/human'
};

interface SnpSearchBoxProps {
	genomeConfig: GenomeConfig;
	navContext: NavigationContext;
	/**
	 * Called when the user chooses a gene and wants to go to it in the nav context.  Signature:
	 *     (newStart: number, newEnd: number): void
	 *         `newStart`: the nav context coordinate of the start of the view interval
	 *         `newEnd`: the nav context coordinate of the end of the view interval
	 */
	onRegionSelected: (...interval: number[]) => void;
	handleCloseModal: () => void;
	onSetEnteredRegion: (interval: ChromosomeInterval) => void;
}

// FIXME: this is the interface for the data returned by the axios call, i have no idea what to call it so i just gave it this name
interface SnpResult {
	synonyms: string[];
	mappings: {
		location: string;
		strand: number;
		allele_string: string;
	}[];
	name: string;
	ambiguity: string;
	ancestral_allele: string;
	source: string;
}

/**
 * A box that accepts SNP id search.
 *
 * @author Daofeng Li and Silas Hsu
 */
const SnpSearchBox: React.FC<SnpSearchBoxProps> = ({ genomeConfig, navContext, handleCloseModal, onRegionSelected, onSetEnteredRegion }) => {
	const [inputValue, setInputValue] = useState<string>('');
	const [result, setResult] = useState<SnpResult>(null);
	const [loadingMsg, setLoadingMsg] = useState<string>('');

	const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(event.target.value);
	}, []);

	const searchSnp = useCallback(
		_.debounce(async () => {
			const input = inputValue.trim();

			if (input.length < 1) {
				notify.show('Please input a valid SNP id.', 'error', 2000);
				return;
			}

			const genomeName = genomeConfig.genome.getName();
			const endpoint = SNP_ENDPOINTS[genomeName];

			if (!endpoint) {
				notify.show('This genome is not supported in SNP search.', 'error', 2000);
				return;
			}

			setLoadingMsg('searching...');

			const params = {
				'content-type': 'application/json'
			};
			const response = await axios.get(`${endpoint}/${input}`, { params: params });

			setResult(response.data);
			setLoadingMsg('');
		}, DEBOUNCE_INTERVAL),
		[inputValue, genomeConfig]
	);

	/**
     * @param {Object} 
     * allele_string: "G/A"
        assembly_name: "GRCh37"
        coord_system: "chromosome"
        end: 212464
        location: "11:212464-212464"
        seq_region_name: "11"
        start: 212464
        strand: 1
     */
	const setViewToSnp = useCallback(
		(entry) => {
			const chrInterval = new ChromosomeInterval(`chr${entry.seq_region_name}`, entry.start - 1, entry.end);
			const interval = navContext.convertGenomeIntervalToBases(chrInterval)[0];
			if (interval) {
				onRegionSelected(...interval);
				handleCloseModal();
				onSetEnteredRegion(chrInterval);
			} else {
				notify.show('SNP not available in current region set view', 'error', 2000);
			}
		},
		[navContext]
	);

	const renderSNP = useCallback(
		(snp: SnpResult) => {
			const synonyms = snp.synonyms.map((item, i) => <li key={i}>{item}</li>);
			const mappings = snp.mappings.map((item, i) => (
				<li
					style={{
						color: 'blue',
						textDecoration: 'underline',
						cursor: 'pointer'
					}}
					key={i}
					onClick={() => setViewToSnp(item)}>
					chr{item.location} {item.strand === 1 ? '+' : '-'} {item.allele_string}
				</li>
			));
			return (
				<table className="table table-sm table-striped table-bordered">
					<tbody>
						<tr>
							<td>name</td>
							<td>{snp.name}</td>
						</tr>
						<tr>
							<td>location</td>
							<td>
								<ol style={{ marginBottom: 0 }}>{mappings}</ol>
							</td>
						</tr>
						<tr>
							<td>ambiguity</td>
							<td>{snp.ambiguity}</td>
						</tr>
						<tr>
							<td>ancestral_allele</td>
							<td>{snp.ancestral_allele}</td>
						</tr>
						<tr>
							<td>synonyms</td>
							<td>
								<ol style={{ marginBottom: 0 }}>{synonyms}</ol>
							</td>
						</tr>
						<tr>
							<td>source</td>
							<td>{snp.source}</td>
						</tr>
					</tbody>
				</table>
			);
		},
		[setViewToSnp]
	);

	return (
		<div>
			<div>
				<input type="text" size={20} placeholder="SNP id" onChange={handleInputChange} />
				<button className="btn btn-secondary btn-sm" style={{ marginLeft: '2px' }} onClick={searchSnp}>
					Go
				</button>{' '}
				<span className="text-info font-italic">{loadingMsg}</span>
			</div>
			<div style={{ position: 'absolute', zIndex: 2, backgroundColor: 'white' }}>{result && renderSNP(result)}</div>
		</div>
	);
};

export default withCurrentGenome(SnpSearchBox);
