import ChromosomeInterval from 'model/interval/ChromosomeInterval';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import ReactModal from 'react-modal';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import { CopyToClip } from '../CopyToClipboard';
import GeneSearchBox from './GeneSearchBox';
import SnpSearchBox from './SnpSearchBox';

const MODAL_STYLE = {
	content: {
		top: '40px',
		left: '300px',
		right: 'unset',
		bottom: 'unset',
		overflow: 'visible',
		padding: '5px',
		color: 'black'
	},
	overlay: {
		backgroundColor: 'rgba(111,107,101, 0.7)',
		zIndex: 4
	}
};

const X_BUTTON_STYLE = {
	cursor: 'pointer',
	color: 'red',
	fontSize: '2em',
	position: 'absolute',
	top: '-5px',
	right: '15px'
} as const;

interface TrackRegionControllerProps {
	selectedRegion: DisplayedRegionModel;
	virusBrowserMode: boolean;
	/**
	 * Called when the user types a region to go to and it is successfully parsed.  Has the signature
	 *     (newStart: number, newEnd: number): void
	 *         `newStart`: the nav context coordinate of the start of the interval
	 *         `newEnd`: the nav context coordinate of the end of the interval
	 */
	onRegionSelected: (...interval: number[]) => void;
	onSetEnteredRegion: (interval: ChromosomeInterval) => void;
}

/**
 * The display that is above the main pane of the genome navigator, which shows the current track region and a text
 * input to modify it.
 *
 * @author Silas Hsu
 */
const TrackRegionController: React.FC<TrackRegionControllerProps> = ({ onRegionSelected, onSetEnteredRegion, selectedRegion, virusBrowserMode }) => {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [badInputMessage, setBadInputMessage] = useState<string>('');
	const [showModal, setShowModal] = useState<boolean>(false);
	const coordinates = useMemo(() => selectedRegion.currentRegionAsString(), [selectedRegion]);

	const handleOpenModal = useCallback(() => {
		setShowModal(true);
	}, []);

	const handleCloseModal = useCallback(() => {
		setShowModal(false);
	}, []);

	/**
	 * Parses user input that expresses a desired region for tracks to display.
	 */
	const parseRegion = useCallback(() => {
		let parsedRegion = null;
		const navContext = selectedRegion.getNavigationContext();

		try {
			parsedRegion = navContext.parse(inputRef.current.value);
		} catch (error) {
			if (error instanceof RangeError) {
				setBadInputMessage(error.message);
				return;
			} else {
				throw error;
			}
		}

		// Yay, parsing successful!
		if (badInputMessage.length > 0) {
			setBadInputMessage('');
		}

		onRegionSelected(parsedRegion.start, parsedRegion.end);
		onSetEnteredRegion(navContext.getLociInInterval(parsedRegion.start, parsedRegion.end)[0]);
		handleCloseModal();
	}, [onRegionSelected, onSetEnteredRegion, handleCloseModal]);

	const keyPress = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.keyCode === 13) {
				parseRegion();
			}
		},
		[parseRegion]
	);

	return (
		<div className="tool-element">
			<button className="btn btn-secondary" onClick={handleOpenModal}>
				{coordinates}
			</button>
			<ReactModal
				isOpen={showModal}
				contentLabel="Gene & Region search"
				ariaHideApp={false}
				onRequestClose={handleCloseModal}
				shouldCloseOnOverlayClick={true}
				style={MODAL_STYLE}>
				<span className="text-right" style={X_BUTTON_STYLE} onClick={handleCloseModal}>
					×
				</span>
				<h6>Gene search</h6>
				<GeneSearchBox
					navContext={selectedRegion.getNavigationContext()}
					onRegionSelected={onRegionSelected}
					handleCloseModal={handleCloseModal}
					// onToggleHighlight={onToggleHighlight}
					onSetEnteredRegion={onSetEnteredRegion}
				/>
				{!virusBrowserMode && (
					<>
						<h6 style={{ marginTop: '5px' }}>SNP search</h6>
						<SnpSearchBox
							navContext={selectedRegion.getNavigationContext()}
							onRegionSelected={onRegionSelected}
							handleCloseModal={handleCloseModal}
							// onToggleHighlight={onToggleHighlight}
							onSetEnteredRegion={onSetEnteredRegion}
						/>
					</>
				)}
				<h6>
					Region search (current region is {coordinates} <CopyToClip value={coordinates} />)
				</h6>
				<input
					ref={(input) => (inputRef.current = input)}
					type="text"
					size={30}
					placeholder="Coordinate"
					// onClick={this.handleClick}
					onKeyDown={keyPress}
				/>
				<button className="btn btn-secondary btn-sm" style={{ marginLeft: '2px' }} onClick={parseRegion}>
					Go
				</button>
				{badInputMessage.length > 0 && <span className="alert-danger">{badInputMessage}</span>}
			</ReactModal>
		</div>
	);
};

export default TrackRegionController;
