import axios from 'axios';
import _ from 'lodash';
import Gene from 'model/Gene';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Autosuggest from 'react-autosuggest';
import { Manager, Popper, Target } from 'react-popper';
import { useSpeechRecognition } from 'react-speech-recognition';
import '../../autosuggest.css';
import { AWS_API } from '../../dataSources/GeneSource';
import { Genome } from '../../model/genomes/Genome';
import OutsideClickDetector from '../OutsideClickDetector';
import withCurrentGenome from '../withCurrentGenome';
import './GeneSearchBox.css';
import IsoformSelection from './IsoformSelection';

const MIN_CHARS_FOR_SUGGESTIONS = 3; // Minimum characters to type before displaying suggestions
const ENTER_KEY_CODE = 13;
const ISOFORM_POPOVER_STYLE = {
	zIndex: 10,
	border: '2px solid grey',
	backgroundColor: 'white',
	maxHeight: '800px',
	overflow: 'auto'
};
const DEBOUNCE_INTERVAL = 250;
const options = {
	autoStart: false
};

interface GeneSearchBoxBaseProps {
	genomeConfig: {
		// Current genome
		genome: Genome;
	};
	onGeneSelected: (gene: Gene) => void;
	voiceInput: boolean;
	simpleMode: boolean;
	browserSupportsSpeechRecognition?: boolean;
}

/**
 * A box that accepts gene name queries, and gives suggestions as well.
 *
 * @author Daofeng Li and Silas Hsu
 */
const GeneSearchBoxBase: React.FC<GeneSearchBoxBaseProps> = ({
	genomeConfig,
	onGeneSelected,
	simpleMode,
	voiceInput,
	browserSupportsSpeechRecognition = false
}) => {
	const inputRef = useRef<Autosuggest | null>(null);
	const [inputValue, setInputValue] = useState<string>(''); // user's input
	const [suggestions, setSuggestions] = useState<string[]>([]); // Matching gene symbols for the current input
	const [isShowingIsoforms, setIsShowingIsoforms] = useState<boolean>(false);
	const [speechInput, setSpeechInput] = useState<boolean>(false); // text search input or speech
	const { transcript, resetTranscript } = useSpeechRecognition();

	const getSuggestions = useCallback(
		_.debounce(async (changeData) => {
			const genomeName = genomeConfig.genome.getName();
			const params = {
				q: changeData.value.trim(),
				getOnlyNames: true
			};
			const response = await axios.get(`${AWS_API}/${genomeName}/genes/queryName`, { params: params });
			setSuggestions(response.data);
		}, DEBOUNCE_INTERVAL),
		[]
	);

	const handleInputChange = useCallback((event, { newValue }) => {
		setInputValue(newValue);
		setIsShowingIsoforms(false);
	}, []);

	const shouldSuggest = useCallback(
		(value) => {
			return isShowingIsoforms && value.trim().length >= MIN_CHARS_FOR_SUGGESTIONS;
		},
		[isShowingIsoforms]
	);

	const showIsoforms = useCallback(() => {
		setSuggestions([]);
		setIsShowingIsoforms(true);
	}, []);

	const showIsoformsIfEnterPressed = useCallback(
		(event) => {
			if (event.keyCode === ENTER_KEY_CODE) {
				showIsoforms();
			}
		},
		[showIsoforms]
	);

	/**
	 * @param {Gene} gene
	 */
	const setSelectedGene = useCallback(
		(gene: Gene) => {
			if (onGeneSelected) {
				onGeneSelected(gene);
			}
			setIsShowingIsoforms(false);
		},
		[onGeneSelected]
	);

	const startListening = useCallback(() => {
		startListening();
		setSpeechInput(true);
	}, []);

	const stopListening = useCallback(() => {
		stopListening();
		setSpeechInput(false);
	}, []);

	useEffect(() => {
		if (transcript) {
			setInputValue(transcript.replace(/\s/g, ''));
			setTimeout(() => {
				if (inputRef.current) {
					inputRef.current.input.focus();
				}
			}, 0);
		}
	}, [transcript]);

	let speechSearchBox;
	if (voiceInput) {
		if (browserSupportsSpeechRecognition) {
			speechSearchBox = (
				<div className="GeneSearchBox-speech">
					<button className="btn btn-success btn-sm" onClick={startListening}>
						Say a Gene
					</button>
					<button className="btn btn-info btn-sm" onClick={resetTranscript}>
						Reset
					</button>
					<button className="btn btn-danger btn-sm" onClick={stopListening}>
						Stop
					</button>
				</div>
			);
		}
	}
	let isoformPane = null;
	if (isShowingIsoforms) {
		isoformPane = (
			<Popper placement="bottom-start" style={ISOFORM_POPOVER_STYLE}>
				<OutsideClickDetector onOutsideClick={() => setIsShowingIsoforms(false)}>
					<IsoformSelection geneName={inputValue} onGeneSelected={setSelectedGene} simpleMode={simpleMode} />
				</OutsideClickDetector>
			</Popper>
		);
	}

	return (
		<div>
			{speechSearchBox}
			{/* <label style={{ marginBottom: 0 }}>Gene search</label> */}
			<Manager>
				<Target>
					<Autosuggest
						suggestions={suggestions}
						shouldRenderSuggestions={shouldSuggest}
						onSuggestionsFetchRequested={getSuggestions}
						onSuggestionsClearRequested={() => setSuggestions([])}
						getSuggestionValue={_.identity}
						renderSuggestion={_.identity}
						inputProps={{
							placeholder: 'Gene symbol',
							value: inputValue,
							onChange: handleInputChange,
							onKeyUp: showIsoformsIfEnterPressed
						}}
						ref={(input) => (inputRef.current = input)}
						onSuggestionSelected={showIsoforms}
					/>
				</Target>
				{isoformPane}
			</Manager>
		</div>
	);
};

export default withCurrentGenome(GeneSearchBoxBase);
