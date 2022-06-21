import React, { useState, useMemo, useEffect, useRef } from "react";
import { Action, Dispatch } from 'redux';
import { ContainerActionsCreatorsFactory, GenomeState, SyncedContainer } from "AppState";
import TrackContainer from '../trackContainers/TrackContainer';
import { RegionExpander } from "model/RegionExpander";
import { GenomeConfig } from "model/genomes/GenomeConfig";
import { getGenomeConfig } from "model/genomes/allGenomes";
import { Model } from "flexlayout-react";
import { HighlightInterval } from "../trackContainers/HighlightMenu";
import GenomeNavigator from "../genomeNavigator/GenomeNavigator";
import { connect } from "react-redux";
import TrackModel from "model/TrackModel";
import StateSyncSettings from './StateSyncSettings';
import {
    Grid, Typography
} from '@material-ui/core';
import ContainerTools, { ProvidedControls } from "./ContainerTools";
import { Tools } from "components/trackContainers/Tools";
import InlineEditable from "components/InlineEditable";

interface StateContainerProps {
    stateIdx: number;
    cdata: SyncedContainer;
    layoutModel: Model;
    viewer3dNumFrames: any;
    isThereG3dTrack: boolean;
    isShowingNavigator: boolean;
    containerTitles: string[];
    embeddingMode: boolean;
    onSetAnchors3d: (anchors: any) => void;
    onSetGeneFor3d: (gene: any) => void;
    onSetImageInfo: (info: any) => void;

    // redux actions, set as optional because typescript isn't ommitting them from the connected component
    onSetHighlights?: (highlights: HighlightInterval[], genomeIdx?: number) => void;
    onSetViewRegion?: (newStart: number, newEnd: number) => void;
    onTracksChanged?: (tracks: TrackModel[], genomeIdx?: number) => void;
    onMetadataTermsChanged?: (terms: string[], genomeIdx?: number) => void;
    onTitleChanged?: (title: string, genomeIdx?: number) => void;
}

function _ContainerView(props: StateContainerProps) {
    const {
        stateIdx,
        cdata,
        layoutModel,
        viewer3dNumFrames,
        isThereG3dTrack,
        isShowingNavigator,
        containerTitles,
        embeddingMode,
        onSetAnchors3d,
        onSetGeneFor3d,
        onSetImageInfo,

        onSetHighlights,
        onSetViewRegion,
        onTracksChanged,
        onMetadataTermsChanged,
        onTitleChanged,
    } = props;
    const { title, genomes, viewRegion, metadataTerms, regionSets, regionSetView, trackLegendWidth, highlights } = cdata;

    const [highlightColor, setHighlightColor] = useState("rgba(255, 255, 0, 0.3)");
    const [highlightEnteredRegion, setHighlightEnteredRegion] = useState(true);
    const [regionExpanders, setRegionExpanders] = useState<RegionExpander[]>(new Array(genomes.length).fill(new RegionExpander(1)));
    const [suggestedMetaSets, setSuggestedMetaSets] = useState(new Set(["Track type"]));
    const [trackControls, setTrackControls] = useState<ProvidedControls[]>([]);
    const [tool, setTool] = useState<typeof Tools.DRAG>(Tools.DRAG);

    useEffect(() => {
        // whenever there is another genome added, add a region expander for it
        if (genomes.length > regionExpanders.length) {
            setRegionExpanders([...regionExpanders, new RegionExpander(1)]);
        }
        // TODO: when a genome is removed, remove the correct region expander instead of the last one.
        // whenever there is another genome removed, remove the region expander for it
        if (genomes.length < regionExpanders.length) {
            setRegionExpanders(regionExpanders.slice(0, genomes.length));
        }
        setTrackControls(new Array(genomes.length));
    }, [genomes.length]);

    const genomeConfigs: GenomeConfig[] = useMemo(() => genomes.map(g => {
        return g.genomeConfig || getGenomeConfig(g.name);
    }), [genomes]);

    const newHighlight = (start: number, end: number, tag: string = '', genomeIdx?: number, curHighlights?: HighlightInterval[]) => {
        const interval = new HighlightInterval(start, end, tag);
        const existing = highlights.find(h => h.start === start && h.end === end)
        if (!existing) {
            onSetHighlights([...(curHighlights || highlights), interval], genomeIdx);
        }
    }

    const renderGenomes = () => {
        return genomes.map((g, gIdx) => {
            const genomeConfig = genomeConfigs[gIdx];
            return (
                <div key={gIdx}>
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
                        </Grid>
                    </div>
                    <TrackContainer
                        key={(gIdx + 1) * genomes.length}
                        enteredRegion={null}
                        highlightColor={highlightColor}
                        highlightEnteredRegion={highlightEnteredRegion}
                        expansionAmount={regionExpanders[gIdx]}
                        suggestedMetaSets={suggestedMetaSets}
                        genomeConfig={genomeConfig}
                        tracks={g.tracks.filter(tk => tk.type !== "g3d")}
                        layoutModel={layoutModel}
                        onSetAnchors3d={onSetAnchors3d}
                        onSetGeneFor3d={onSetGeneFor3d}
                        viewer3dNumFrames={viewer3dNumFrames}
                        isThereG3dTrack={isThereG3dTrack}
                        onSetImageInfo={onSetImageInfo}
                        onNewHighlight={(start: number, end: number, tag: string = '') => newHighlight(start, end, tag, gIdx, g.highlights)}
                        highlights={g.highlights}
                        onSetHighlights={(highlights: HighlightInterval[]) => onSetHighlights(highlights, gIdx)}

                        genome={g.name}
                        viewRegion={viewRegion}
                        metadataTerms={metadataTerms}

                        // formerly connected through redux
                        onNewRegion={onSetViewRegion}
                        onTracksChanged={(newTracks: TrackModel[]) => onTracksChanged(newTracks, gIdx)}
                        onMetadataTermsChanged={(newTerms: string[]) => onMetadataTermsChanged(newTerms, gIdx)}

                        provideControl={(c: ProvidedControls) => trackControls[gIdx] = c}
                        tool={tool}
                        inContainer
                    />
                </div>
            );
        });
    };

    return (
        <div>
            <Grid container direction="row" alignItems="center">
                <Grid item>
                    <div style={{
                        marginLeft: 20,
                        marginRight: 20
                    }}>
                        <InlineEditable
                            value={title}
                            onChange={(newTitle: string) => onTitleChanged(newTitle)}
                            variant="h6"
                            prohibitedValues={["new container"]}
                        />
                    </div>
                </Grid>
                <Grid item>
                    <ContainerTools
                        trackControls={trackControls}
                        tool={tool}
                        onToolChanged={setTool}
                        embeddingMode={embeddingMode}

                        viewRegion={viewRegion}
                        onNewRegion={onSetViewRegion}
                        // TODO: change this to container highlights
                        highlights={genomes[0].highlights}
                        onSetHighlights={(highlights: HighlightInterval[]) => onSetHighlights(highlights, 0)}
                        metadataTerms={metadataTerms}
                        onMetadataTermsChanged={(newTerms: string[]) => onMetadataTermsChanged(newTerms, 0)}
                        suggestedMetaSets={suggestedMetaSets}
                    />
                </Grid>
            </Grid>
            <div style={{
                border: "1px solid #C4C4C4",
                borderRadius: "30px",
                overflow: "hidden",
            }}>
                {isShowingNavigator && (
                    <GenomeNavigator inContainer selectedRegion={viewRegion} onRegionSelected={onSetViewRegion} genomeConfig={genomeConfigs[0]} /> // TODO: either create a switch that allows use of genomeConfig of choice or overlays all of the genomes configs in different colors.
                )}
                {renderGenomes()}
            </div>
        </div>
    )
}

const mapDispatchToPropsFactory = (dispatch: Dispatch<Action>, ownProps: StateContainerProps) => {
    const specializedActionCreators = ContainerActionsCreatorsFactory(ownProps.stateIdx);
    return {
        onSetHighlights: (highlights: HighlightInterval[], genomeIdx?: number) => dispatch(specializedActionCreators.setHighlights(highlights, genomeIdx)),
        onSetViewRegion: (newStart: number, newEnd: number) => dispatch(specializedActionCreators.setViewRegion(newStart, newEnd)),
        onTracksChanged: (newTracks: TrackModel[], genomeIdx?: number) => dispatch(specializedActionCreators.setTracks(newTracks, genomeIdx)),
        onMetadataTermsChanged: (newTerms: string[], genomeIdx?: number) => dispatch(specializedActionCreators.setMetadataTerms(newTerms, genomeIdx)),
        onTitleChanged: (newTitle: string, genomeIdx?: number) => dispatch(specializedActionCreators.setTitle(newTitle, genomeIdx)),
    }
}

const ContainerView = connect(
    null,
    mapDispatchToPropsFactory
)(_ContainerView);

export default ContainerView;