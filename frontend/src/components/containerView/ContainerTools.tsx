import ButtonGroup from 'components/trackContainers/ButtonGroup';
import { HighlightInterval, } from 'components/trackContainers/HighlightMenu';
import ContainerHighlightMenu, { ContainerHighlightInterval } from './ContainerHighlightMenu';
import History from 'components/trackContainers/History';
import MetadataHeader from 'components/trackContainers/MetadataHeader';
import ReorderMany from 'components/trackContainers/ReorderMany';
import ZoomButtons from 'components/trackContainers/ZoomButtons';
import DisplayedRegionModel from 'model/DisplayedRegionModel';
import React, { useState, useMemo, useEffect } from 'react';
import { GenomeState } from 'AppState';
import { ViewExpansion } from 'model/RegionExpander';
import { niceBpCount } from '../../util';

export interface ProvidedControls {
    genomeIdx: number;
    panLeftOrRight: Function;
    zoomOut: Function;
    getPixelInfo: () => PixelInfoData;
}

export interface PixelInfoData {
    primaryView: ViewExpansion;
    basesPerPixel: number;
    viewRegion: number;
}

interface ContainerToolsProps {
    trackControls: ProvidedControls[];

    embeddingMode: boolean;
    viewRegion: DisplayedRegionModel;
    onNewRegion: (newStart: number, newEnd: number) => void;
    genomes: GenomeState[];
    onSetCHighlights: (highlights: HighlightInterval[], genomeIdx?: number) => void;
    metadataTerms: string[];
    onMetadataTermsChanged: (terms: string[]) => void;
    suggestedMetaSets: Set<string>;
};

function ContainerTools(props: ContainerToolsProps) {
    const {
        trackControls,
        viewRegion,
        onNewRegion,
        onSetCHighlights,
        genomes,
        metadataTerms,
        onMetadataTermsChanged,
        suggestedMetaSets,
    } = props;
    const [reorderManyModalOpen, setReorderManyModalOpen] = useState(false);
    const [highlightModalOpen, setHighlightModalOpen] = useState(false);
    const [pixelInfo, setPixelInfo] = useState<PixelInfoData | null>(null);

    useEffect(() => {
        if (trackControls[0]) {
            setTimeout(() => {
                setPixelInfo(trackControls[0].getPixelInfo());
            }, 100)
        } else if (trackControls[0]) {
            setPixelInfo(trackControls[0].getPixelInfo());
        }
    }, [viewRegion, trackControls])

    const openReorderManyModal = () => setReorderManyModalOpen(true);
    const closeReorderManyModal = () => setReorderManyModalOpen(false);
    const openHighlightModal = () => setHighlightModalOpen(true);
    const closeHighlightModal = () => setHighlightModalOpen(false);

    const gNames = useMemo(() => genomes.map(g => g.name), [genomes]);

    const applyAllContainers = (callback: (trackContainer: ProvidedControls) => void) => {
        trackControls.forEach(trackControl => {
            callback(trackControl);
        });
    };

    const translateContainerHighlights = (): ContainerHighlightInterval[] => {
        const res: ContainerHighlightInterval[] = [];
        for (let i = 0; i < genomes.length; i++) {
            const highlights = genomes[i].highlights;
            for (let j = 0; j < highlights.length; j++) {
                // const { start, end, tag, color, display } = highlights[j];
                res.push({ ...highlights[j], genomeIdx: i });
            }
        }
        return res;
    }

    const translatedContainerHighlights = translateContainerHighlights();

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
                {/* <ToolButtons
                    allTools={Tools}
                    selectedTool={tool}
                    onToolClicked={tool => onToolChanged(tool)}
                /> */}
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
                    <History />
                </div>
                <div className="tool-element" style={{ display: "flex", alignItems: "center" }}>
                    <ContainerHighlightMenu
                        onSetHighlights={onSetCHighlights}
                        onOpenHighlightMenuModal={openHighlightModal}
                        onCloseHighlightMenuModal={closeHighlightModal}
                        showHighlightMenuModal={highlightModalOpen}
                        highlights={translatedContainerHighlights}
                        viewRegion={viewRegion}
                        onNewRegion={onNewRegion}
                        genomeNames={gNames}
                    />
                </div>
                {(pixelInfo && pixelInfo.primaryView) && (
                    <div className="tool-element" style={{ minWidth: "200px", alignSelf: "center" }}>
                        <PixelInfo
                            basesPerPixel={pixelInfo.basesPerPixel}
                            viewRegion={pixelInfo.viewRegion}
                            primaryView={pixelInfo.primaryView}
                        />
                    </div>
                )}
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