import React from 'react';
import {
    Grid,
    Typography
} from '@material-ui/core';

import TrackRegionController from './genomeNavigator/TrackRegionController';
import StateSyncSettings from './StateSyncSettings';
import { GenomeState } from 'AppState';
import DisplayedRegionModel from 'model/DisplayedRegionModel';
import TrackContainer from '../trackContainers/TrackContainer';
import { HighlightInterval } from 'components/trackContainers/HighlightMenu';
import TrackModel from 'model/TrackModel';

interface ContainerGenomeProps {
    stateIdx: number;
    gIdx: number;
    containerTitles: string[];
    genomes: GenomeState[];
    viewRegion: DisplayedRegionModel;

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
    // const {
    //     stateIdx,
    //     gIdx,
    //     containerTitles,
    //     genomes,
    //     viewRegion,

    //     onSetAnchors3d,
    //     onSetGeneFor3d,
    //     onSetImageInfo,

    //     onSetHighlights,
    //     onSetViewRegion,
    //     onTracksChanged,
    //     onMetadataTermsChanged,
    // } = props;

    // const g = genomes[gIdx];
    // return (
    //     <>
    //         <div style={{
    //             marginLeft: 10
    //         }}>
    //             <Grid container direction="row" alignItems="center">
    //                 <Grid item>
    //                     <Typography variant="h6">{g.title}</Typography>
    //                 </Grid>
    //                 <Grid item>
    //                     <StateSyncSettings
    //                         containerIdx={stateIdx}
    //                         genomeIdx={gIdx}
    //                         genomeSettings={g.settings}
    //                         containerTitles={containerTitles}
    //                         allowNewContainer={genomes.length > 1}
    //                     />
    //                 </Grid>
    //                 <Grid item style={{ marginLeft: 50 }}>
    //                     <TrackRegionController
    //                         viewRegion={viewRegion}
    //                         genomeConfig={g.genomeConfig}
    //                         onRegionSelected={onSetViewRegion}
    //                     />
    //                 </Grid>
    //             </Grid>
    //         </div>
    //         <TrackContainer
    //             key={(gIdx + 1) * genomes.length}
    //             enteredRegion={null}
    //             highlightColor={highlightColor}
    //             highlightEnteredRegion={highlightEnteredRegion}
    //             expansionAmount={regionExpanders[gIdx]}
    //             suggestedMetaSets={suggestedMetaSets}
    //             genomeConfig={genomeConfig}
    //             tracks={g.tracks.filter(tk => tk.type !== "g3d")}
    //             layoutModel={layoutModel}
    //             onSetAnchors3d={onSetAnchors3d}
    //             onSetGeneFor3d={onSetGeneFor3d}
    //             viewer3dNumFrames={viewer3dNumFrames}
    //             isThereG3dTrack={isThereG3dTrack}
    //             onSetImageInfo={onSetImageInfo}
    //             onNewHighlight={(start: number, end: number, tag: string = '') => newHighlight(start, end, tag, gIdx, g.highlights)}
    //             highlights={g.highlights}
    //             onSetHighlights={(highlights: HighlightInterval[]) => onSetHighlights(highlights, gIdx)}

    //             genome={g.name}
    //             viewRegion={viewRegion}
    //             metadataTerms={g.metadataTerms}

    //             // formerly connected through redux
    //             onNewRegion={onSetViewRegion}
    //             onTracksChanged={(newTracks: TrackModel[]) => onTracksChanged(newTracks, gIdx)}
    //             onMetadataTermsChanged={(newTerms: string[]) => onMetadataTermsChanged(newTerms, gIdx)}

    //             provideControl={(c: ProvidedControls) => {
    //                 trackControls[gIdx] = c;
    //             }}
    //             tool={tool}
    //             inContainer
    //         />
    //     </>
    // );
}

export default ContainerGenome;