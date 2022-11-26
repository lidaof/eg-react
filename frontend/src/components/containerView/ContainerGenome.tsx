import React from 'react';
import {
    Grid,
    Typography
} from '@material-ui/core';

import TrackRegionController from './genomeNavigator/TrackRegionController';
import StateSyncSettings from './StateSyncSettings';
import { GenomeState, SyncedContainer } from 'AppState';
import DisplayedRegionModel from 'model/DisplayedRegionModel';
import TrackContainer from '../trackContainers/TrackContainer';
import { HighlightInterval } from 'components/trackContainers/HighlightMenu';
import TrackModel from 'model/TrackModel';
import { RegionExpander } from 'model/RegionExpander';
import { ProvidedControls } from './ContainerTools';
import { Tools } from 'components/trackContainers/Tools';

const REGION_EXPANDER = new RegionExpander(1);

interface ContainerGenomeProps {
    stateIdx: number;
    gIdx: number;
    parentContainer: SyncedContainer;
    containerTitles: string[];
    genomes: GenomeState[];
    viewRegion: DisplayedRegionModel;
    virusBrowserMode: boolean;
    highlightColor: string;
    highlightEnteredRegion: boolean;
    viewer3dNumFrames: any;
    isThereG3dTrack: boolean;
    activeTool: typeof Tools.DRAG;
    suggestedMetaSets: Set<string>;

    accessTrackControls: (c: ProvidedControls, gIdx: number) => void;
    newHighlight: (start: number, end: number, tag: string, genomeIdx?: number, curHighlights?: HighlightInterval[]) => void;

    onSetAnchors3d: (anchors: any) => void;
    onSetGeneFor3d: (gene: any) => void;
    onSetImageInfo: (info: any) => void;

    // redux actions, set as optional because typescript isn't ommitting them from the connected component
    onSetHighlights?: (highlights: HighlightInterval[], genomeIdx?: number) => void;
    onSetViewRegion?: (newStart: number, newEnd: number) => void;
    onTracksChanged?: (tracks: TrackModel[], genomeIdx?: number) => void;
    onMetadataTermsChanged?: (terms: string[], genomeIdx?: number) => void;
}

function ContainerGenome(props: ContainerGenomeProps) {
    const {
        stateIdx,
        gIdx,
        containerTitles,
        genomes,
        viewRegion,
        virusBrowserMode,
        highlightColor,
        highlightEnteredRegion,
        viewer3dNumFrames,
        isThereG3dTrack,
        parentContainer,
        activeTool,
        suggestedMetaSets,

        accessTrackControls,
        newHighlight,

        onSetAnchors3d,
        onSetGeneFor3d,
        onSetImageInfo,

        onSetHighlights,
        onSetViewRegion,
        onTracksChanged,
        onMetadataTermsChanged,
    } = props;
    const { genomeConfig, } = genomes[gIdx]
    const { metadataTerms } = parentContainer;



    const g = genomes[gIdx];
    const { offsetAmount } = g.settings;
    let translated = viewRegion;
    if (offsetAmount !== 0) {
        const navContext = translated.getNavigationContext();
        const contextCoords = translated.getContextCoordinates();
        const { start, end } = contextCoords;
        translated = new DisplayedRegionModel(navContext, start + offsetAmount, end + offsetAmount);
    }

    return (
        <>
            <div style={{
                marginLeft: 10
            }}>
                <Grid container direction="row" alignItems="center">
                    <Grid item>
                        <Typography variant="h6">{g.title}</Typography>
                    </Grid>
                    <Grid item>
                        <StateSyncSettings
                            containerIdx={stateIdx}
                            genomeIdx={gIdx}
                            genomeSettings={g.settings}
                            containerTitles={containerTitles}
                            allowNewContainer={genomes.length > 1}
                        />
                    </Grid>
                    <Grid item style={{ marginLeft: 50 }}>
                        <TrackRegionController
                            viewRegion={translated}
                            genomeConfig={g.genomeConfig}
                            onRegionSelected={onSetViewRegion}
                            virusBrowserMode={virusBrowserMode}
                        />
                    </Grid>
                </Grid>
            </div>
            <TrackContainer
                key={(gIdx + 1) * genomes.length}
                enteredRegion={null}
                highlightColor={highlightColor}
                highlightEnteredRegion={highlightEnteredRegion}
                expansionAmount={REGION_EXPANDER}
                suggestedMetaSets={suggestedMetaSets}
                genomeConfig={genomeConfig}
                tracks={g.tracks.filter(tk => tk.type !== "g3d")}
                onSetAnchors3d={onSetAnchors3d}
                onSetGeneFor3d={onSetGeneFor3d}
                viewer3dNumFrames={viewer3dNumFrames}
                isThereG3dTrack={isThereG3dTrack}
                onSetImageInfo={onSetImageInfo}
                onNewHighlight={(start: number, end: number, tag: string = '') => newHighlight(start, end, tag, gIdx, g.highlights)}
                highlights={g.highlights}
                onSetHighlights={(highlights: HighlightInterval[]) => onSetHighlights(highlights, gIdx)}

                genome={g.name}
                viewRegion={translated}
                metadataTerms={metadataTerms}

                // formerly connected through redux
                onNewRegion={onSetViewRegion}
                onTracksChanged={(newTracks: TrackModel[]) => onTracksChanged(newTracks, gIdx)}
                onMetadataTermsChanged={(newTerms: string[]) => onMetadataTermsChanged(newTerms, gIdx)}

                provideControl={(c: ProvidedControls) => {
                    accessTrackControls(c, gIdx);
                }}
                tool={activeTool}
                inContainer
            />
        </>
    );
}

export default ContainerGenome;