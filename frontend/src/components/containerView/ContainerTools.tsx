import TrackRegionController from 'components/genomeNavigator/TrackRegionController';
import ButtonGroup from 'components/trackContainers/ButtonGroup';
import ReorderMany from 'components/trackContainers/ReorderMany';
import { ToolButtons, Tools } from 'components/trackContainers/Tools';
import UndoRedo from 'components/trackContainers/UndoRedo';
import History from 'components/trackContainers/History';
import ZoomButtons from 'components/trackContainers/ZoomButtons';
import React, { RefObject, useState } from 'react';
import DisplayedRegionModel from 'model/DisplayedRegionModel';
import { HighlightInterval, HighlightMenu } from 'components/trackContainers/HighlightMenu';
import { niceBpCount } from '../../util';
import MetadataHeader from 'components/trackContainers/MetadataHeader';
import {
    IconButton,
} from '@material-ui/core';
import {
    PanTool,
    Shuffle,
    ZoomIn,
    BorderColor,
    SwapVert,
    ArrowLeft,
    ArrowRight,
} from '@material-ui/icons'

export interface ProvidedControls {
    genomeIdx: number;
    panLeftOrRight: Function;
    zoomOut: Function
}

interface ContainerToolsProps {
    trackControls: ProvidedControls[];
    tool: typeof Tools.DRAG;
    onToolChanged: (newTool: any) => void;

    embeddingMode: boolean;
    viewRegion: DisplayedRegionModel;
    onNewRegion: (newStart: number, newEnd: number) => void;
    highlights: HighlightInterval[];
    onSetHighlights: (highlights: HighlightInterval[], genomeIdx?: number) => void;
    metadataTerms: string[];
    onMetadataTermsChanged: (terms: string[]) => void;
    suggestedMetaSets: Set<string>;
};

function ContainerTools(props: ContainerToolsProps) {
    const {
        trackControls,
        tool,
        onToolChanged,
        embeddingMode,
        viewRegion,
        onNewRegion,
        onSetHighlights,
        highlights,
        metadataTerms,
        onMetadataTermsChanged,
        suggestedMetaSets
    } = props;
    const [reorderManyModalOpen, setReorderManyModalOpen] = useState(false);
    const [highlightModalOpen, setHighlightModalOpen] = useState(false);

    const openReorderManyModal = () => setReorderManyModalOpen(true);
    const closeReorderManyModal = () => setReorderManyModalOpen(false);
    const openHighlightModal = () => setHighlightModalOpen(true);
    const closeHighlightModal = () => setHighlightModalOpen(false);

    const applyAllContainers = (callback: (trackContainer: ProvidedControls) => void) => {
        trackControls.forEach(trackControl => {
            callback(trackControl);
        });
    }
    // TODO: implement the keyboard shortcuts.
    const panLeftButton = (
        <button
            className="btn btn-outline-dark"
            title="Pan left
(Alt+Z)"
            style={{ fontFamily: "monospace" }}
            onClick={() => applyAllContainers((e: ProvidedControls) => e.panLeftOrRight(true))}
        >
            ◀
        </button>
    );
    const panRightButton = (
        <button
            className="btn btn-outline-dark"
            title="Pan right
(Alt+X)"
            style={{ fontFamily: "monospace" }}
            onClick={() => applyAllContainers((e: ProvidedControls) => e.panLeftOrRight(false))}
        >
            ▶
        </button>
    );

    return (
        <div className="tool-container">
            <div className="tool-panel">
                <ToolButtons
                    allTools={Tools}
                    selectedTool={tool}
                    onToolClicked={tool => onToolChanged(tool)}
                />
                {/* TODO: support embedding mode */}
                {/* {embeddingMode && (
                    <TrackRegionController
                        selectedRegion={viewRegion}
                        onRegionSelected={onNewRegion}
                        onToggleHighlight={onToggleHighlight}
                        onNewHighlight={onNewHighlight}
                    />
                )} */}
                <div className="tool-element" style={{ display: "flex", alignItems: "center" }}>
                    <ReorderMany
                        onOpenReorderManyModal={openReorderManyModal}
                        onCloseReorderManyModal={closeReorderManyModal}
                        showReorderManyModal={reorderManyModalOpen}
                    />
                </div>
                <ButtonGroup buttons={panLeftButton} />
                {/* <ZoomButtons viewRegion={viewRegion} onNewRegion={onNewRegion} /> */}
                <ZoomButtons viewRegion={viewRegion} onNewRegion={onNewRegion} zoomOut={(factor: number) => applyAllContainers(e => e.zoomOut(factor))} />
                <ButtonGroup buttons={panRightButton} />
                <div className="tool-element" style={{ display: "flex", alignItems: "center" }}>
                    {/* TODO: fix the duplicate undo redo that occurs with more than one genome (have to undo twice for one action when there are two genomes) */}
                    <UndoRedo />
                </div>
                <div className="tool-element" style={{ display: "flex", alignItems: "center" }}>
                    <History />
                </div>
                <div className="tool-element" style={{ display: "flex", alignItems: "center" }}>
                    <HighlightMenu
                        onSetHighlights={onSetHighlights}
                        onOpenHighlightMenuModal={openHighlightModal}
                        onCloseHighlightMenuModal={closeHighlightModal}
                        showHighlightMenuModal={highlightModalOpen}
                        highlights={highlights}
                        viewRegion={viewRegion}
                        onNewRegion={onNewRegion}
                    />
                </div>
                {/* <div className="tool-element" style={{ minWidth: "200px", alignSelf: "center" }}>
                    <PixelInfo
                        basesPerPixel={this.props.basesPerPixel}
                        viewRegion={viewRegion}
                        primaryView={primaryView}
                    />
                </div> */}
                <MetadataHeader
                    terms={metadataTerms}
                    onNewTerms={onMetadataTermsChanged}
                    suggestedMetaSets={suggestedMetaSets}
                />
            </div>
        </div>
    );
}

function PixelInfo(props:any) {
    const { basesPerPixel, viewRegion, primaryView } = props;
    const viewBp = niceBpCount(viewRegion.getWidth());
    const windowWidth = primaryView.viewWindow.getLength();
    const span = niceBpCount(basesPerPixel, true);
    return (
        <span className="font-italic">
            Viewing a {viewBp} region in {Math.round(windowWidth)}px, 1 pixel spans {span}
        </span>
    );
}


export default ContainerTools;