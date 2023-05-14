import React from 'react';
import {
    Grid, IconButton
} from '@material-ui/core';
import { ContainerActionsCreatorsFactory, GenomeState, SyncedContainer } from "AppState";
import InlineEditable from "components/egUI/InlineEditable";
import { Tools } from "components/trackContainers/Tools";
import { Model } from "flexlayout-react";
import { getGenomeConfig } from "model/genomes/allGenomes";
import { GenomeConfig } from "model/genomes/GenomeConfig";
import TrackModel from "model/TrackModel";
import { useEffect, useMemo, useState } from "react";
import { connect } from "react-redux";
import { Action, Dispatch } from 'redux';
import GenomeNavigator from "../genomeNavigator/GenomeNavigator";
import { HighlightInterval } from "../trackContainers/HighlightMenu";
import ContainerTools, { ProvidedControls } from "./ContainerTools";
import ContainerGenome from './ContainerGenome';
import { SyncDisabled, Sync } from '@material-ui/icons';
import { showConfirmationDialog, showDialog } from 'components/DialogProvider';
import SnackbarEngine from 'SnackbarEngine';

/**
 * Render a single genome container, which can contain multiple genomes.
 * @author Shane Liu
 */

interface StateContainerProps {
    stateIdx: number;
    cdata: SyncedContainer;
    layoutModel: Model;
    viewer3dNumFrames: any;
    isThereG3dTrack: boolean;
    isShowingNavigator: boolean;
    containerTitles: string[];
    embeddingMode: boolean;
    virusBrowserMode: boolean;
    activeTool: typeof Tools.DRAG;
    highlightColor: string;
    highlightEnteredRegion: boolean;
    onSetAnchors3d: (anchors: any) => void;
    onSetGeneFor3d: (gene: any) => void;
    onSetImageInfo: (info: any) => void;

    // redux actions, set as optional because typescript isn't ommitting them from the connected component
    onSetHighlights?: (highlights: HighlightInterval[], genomeIdx?: number) => void;
    onSetViewRegion?: (newStart: number, newEnd: number) => void;
    onTracksChanged?: (tracks: TrackModel[], genomeIdx?: number) => void;
    onMetadataTermsChanged?: (terms: string[], genomeIdx?: number) => void;
    onTitleChanged?: (title: string, genomeIdx?: number) => void;
    onNewGenomes?: (newGenomes: GenomeState[]) => void;
}

let promptedAlignAvailable = false;
function _ContainerView(props: StateContainerProps) {
    const {
        stateIdx,
        cdata,
        viewer3dNumFrames,
        isThereG3dTrack,
        isShowingNavigator,
        containerTitles,
        embeddingMode,
        virusBrowserMode,
        activeTool,
        highlightColor,
        highlightEnteredRegion,

        onSetAnchors3d,
        onSetGeneFor3d,
        onSetImageInfo,

        onSetHighlights,
        onSetViewRegion,
        onTracksChanged,
        onMetadataTermsChanged,
        onTitleChanged,
        // onNewGenomes,
    } = props;
    const { title, genomes, viewRegion, highlights, metadataTerms } = cdata;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [suggestedMetaSets, setSuggestedMetaSets] = useState(new Set(["Track type"]));
    const [trackControls, setTrackControls] = useState<ProvidedControls[]>([]);
    const [mainAlign, setMainAlign] = useState<string>("");
    const [mainAlignTrack, setMainAlignTrack] = useState<TrackModel | null>(null);

    useEffect(() => {
        if (trackControls.length !== genomes.length) {
            setTrackControls(new Array(genomes.length));
        }
    }, [genomes.length, trackControls.length]);

    const genomeConfigs: GenomeConfig[] = useMemo(() => genomes.map(g => {
        return g.genomeConfig || getGenomeConfig(g.name);
    }), [genomes]);

    const newHighlight = (start: number, end: number, tag: string = '', genomeIdx?: number, curHighlights?: HighlightInterval[]) => {
        const interval = new HighlightInterval(start, end, tag);
        const existing = highlights.find(h => h.start === start && h.end === end)
        if (!existing) {
            onSetHighlights([...(curHighlights || highlights), interval], genomeIdx);
        }
    };
    const accessTrackControls = (c: ProvidedControls, gIdx: number) => {
        trackControls[gIdx] = c;
    };
    const renderGenomes = () => {
        if (mainAlign && mainAlignTrack) {
            const topGenome = { ...genomes.find(g => g.name === mainAlign) };
            const bottomGenome = genomes.find(g => g.name !== mainAlign);

            if (topGenome.genomeConfig) {
                const mapSecondaryTracks = (trackModel: any) => {
                    const genomeName = bottomGenome.genomeConfig.genome.getName();
                    // trackModel.genome = genomeName;
                    const label = `${trackModel.label} (${genomeName})`;
                    trackModel.label = label; // fix the problem when refresh added genome label is gone
                    trackModel.options = { ...trackModel.options, label };
                    trackModel.metadata = { ...trackModel.metadata, genome: genomeName };
                    return trackModel;
                }

                topGenome.tracks = [...topGenome.tracks, mainAlignTrack, ...bottomGenome.tracks.map(mapSecondaryTracks)];
                topGenome.title = `Align ${bottomGenome.name} to ${topGenome.name}`;

                return (
                    <div>
                        <ContainerGenome
                            stateIdx={stateIdx}
                            gIdx={0}
                            parentContainer={cdata}
                            containerTitles={containerTitles}
                            genomes={[topGenome]}
                            viewRegion={viewRegion}
                            virusBrowserMode={virusBrowserMode}
                            highlightColor={highlightColor}
                            highlightEnteredRegion={highlightEnteredRegion}
                            viewer3dNumFrames={viewer3dNumFrames}
                            isThereG3dTrack={isThereG3dTrack}
                            activeTool={activeTool}
                            suggestedMetaSets={suggestedMetaSets}

                            accessTrackControls={accessTrackControls}
                            newHighlight={newHighlight}

                            onSetAnchors3d={onSetAnchors3d}
                            onSetGeneFor3d={onSetGeneFor3d}
                            onSetImageInfo={onSetImageInfo}

                            onSetHighlights={onSetHighlights}
                            onSetViewRegion={onSetViewRegion}
                            onTracksChanged={onTracksChanged}
                            onMetadataTermsChanged={onMetadataTermsChanged}
                        />
                    </div>
                )
            }
        }

        return genomes.map((g, gIdx) => {
            return (
                <div key={gIdx}>
                    <ContainerGenome
                        stateIdx={stateIdx}
                        gIdx={gIdx}
                        parentContainer={cdata}
                        containerTitles={containerTitles}
                        genomes={genomes}
                        viewRegion={viewRegion}
                        virusBrowserMode={virusBrowserMode}
                        highlightColor={highlightColor}
                        highlightEnteredRegion={highlightEnteredRegion}
                        viewer3dNumFrames={viewer3dNumFrames}
                        isThereG3dTrack={isThereG3dTrack}
                        activeTool={activeTool}
                        suggestedMetaSets={suggestedMetaSets}

                        accessTrackControls={accessTrackControls}
                        newHighlight={newHighlight}

                        onSetAnchors3d={onSetAnchors3d}
                        onSetGeneFor3d={onSetGeneFor3d}
                        onSetImageInfo={onSetImageInfo}

                        onSetHighlights={onSetHighlights}
                        onSetViewRegion={onSetViewRegion}
                        onTracksChanged={onTracksChanged}
                        onMetadataTermsChanged={onMetadataTermsChanged}
                    />
                </div>
            );
        });
    };

    const renderAlignToggle = (): React.ReactElement => {
        if (genomes.length !== 2) return null;
        const endings = genomes.map(g => g.name.split("-")[1]);
        if (endings[0] === endings[1]) return null;
        const [g0, g1] = genomes.map(g => g.name);

        const possibleAlignParents = new Set<string>();

        genomes.forEach(g => {
            const gConfig = g.genomeConfig;
            if (!gConfig) return;
            if (!gConfig.annotationTracks["Genome Comparison"]) return;
            gConfig.annotationTracks["Genome Comparison"].forEach((t: { querygenome: string }) => {
                if (t.querygenome === g0 || t.querygenome === g1) {
                    possibleAlignParents.add(g.name);
                }
            });
        });

        if (possibleAlignParents.size === 0) return null;

        if (!promptedAlignAvailable) {
            promptedAlignAvailable = true
            SnackbarEngine.info("Genome alignment is available here. Click the sync icon to align.");
        }

        const m = () => {
            if (mainAlign) {
                showConfirmationDialog("Are you sure?", "This will unalign the genomes.", () => {
                    setMainAlign("");
                });
            } else {
                if (possibleAlignParents.size === 1) {
                    const onlyGenome = possibleAlignParents.values().next();
                    showDialog("Align genomes?", `You can only choose ${onlyGenome.value} as primary because the other genome does not have an alignment file set.`, [
                        {
                            title: "Cancel",
                            onClick: () => { }
                        },
                        {
                            title: `Align with ${onlyGenome.value} as primary`,
                            onClick: () => setMainAlign(onlyGenome.value)
                        }
                    ]);
                } else {
                    showDialog("Align genomes?", `You can choose ${g0} or ${g1} as the primary genome.`, [
                        {
                            title: "Cancel",
                            onClick: () => { }
                        },
                        {
                            title: `Align with ${g0} as primary`,
                            onClick: () => setMainAlign(g0)
                        },
                        {
                            title: `Align with ${g1} as primary`,
                            onClick: () => setMainAlign(g1)
                        }
                    ]);
                }
            }
        }

        return (
            <IconButton onClick={m}>
                {mainAlign ? <Sync /> : <SyncDisabled />}
            </IconButton>
        )
    }

    useEffect(() => {
        try {
            if (mainAlign) {
                const topGenome = genomes.find(g => g.name === mainAlign);
                const bottomGenome = genomes.find(g => g.name !== mainAlign);

                if (!topGenome.genomeConfig) return;

                const alignTrack = new TrackModel(topGenome.genomeConfig.annotationTracks["Genome Comparison"].find((t: { querygenome: string }) => t.querygenome === bottomGenome.name));

                // const mapSecondaryTracks = (trackModel: any) => {
                //     const genomeName = bottomGenome.genomeConfig.genome.getName();
                //     // trackModel.genome = genomeName;
                //     const label = `${trackModel.label} (${genomeName})`;
                //     trackModel.label = label; // fix the problem when refresh added genome label is gone
                //     trackModel.options = { ...trackModel.options, label };
                //     trackModel.metadata = { ...trackModel.metadata, genome: genomeName };
                //     return trackModel;
                // }

                // topGenome.tracks.push(alignTrack);
                // topGenome.tracks.push(...bottomGenome.tracks.map(mapSecondaryTracks));


                // onNewGenomes([topGenome]);

                setMainAlignTrack(alignTrack);
            } else {
                setMainAlignTrack(null);
            }
        } catch (error) {
            console.error(error);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mainAlign]);

    return (
        <div>
            <Grid container direction="row" alignItems="center" justifyContent='space-between'>
                <Grid item>
                    <div style={{
                        marginLeft: 20,
                        marginRight: 20
                    }}>
                        <InlineEditable
                            value={title}
                            onChange={(newTitle: string) => onTitleChanged(newTitle)}
                            variant="h6"
                            prohibitedValues={["new container", "multiple genomes"]}
                        />
                    </div>
                </Grid>
                <Grid item>
                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                    }}>
                        {renderAlignToggle()}
                        <ContainerTools
                            trackControls={trackControls}
                            embeddingMode={embeddingMode}

                            viewRegion={viewRegion}
                            onNewRegion={onSetViewRegion}
                            // TODO: change this to container highlights
                            genomes={genomes}
                            onSetCHighlights={onSetHighlights}
                            metadataTerms={metadataTerms}
                            onMetadataTermsChanged={(newTerms: string[]) => onMetadataTermsChanged(newTerms)}
                            suggestedMetaSets={suggestedMetaSets}
                        />
                    </div>
                </Grid>
            </Grid>
            <div style={{
                border: "1px solid #C4C4C4",
                borderRadius: 15,
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
        onNewGenomes: (newGenomes: GenomeState[]) => dispatch(specializedActionCreators.setContainerGenomes(newGenomes)),
    }
}

const ContainerView = connect(
    null,
    mapDispatchToPropsFactory
)(_ContainerView);

export default ContainerView;