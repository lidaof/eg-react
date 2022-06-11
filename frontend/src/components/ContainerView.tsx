import React, { useState, useMemo } from "react";
import { Action, Dispatch } from 'redux';
import { GenomeActionsCreatorsFactory, GenomeState, SyncedContainer } from "AppState";
import TrackContainer from './trackContainers/TrackContainer';
import { RegionExpander } from "model/RegionExpander";
import { GenomeConfig } from "model/genomes/GenomeConfig";
import { getGenomeConfig } from "model/genomes/allGenomes";
import { Model } from "flexlayout-react";
import { HighlightInterval } from "./trackContainers/HighlightMenu";
import GenomeNavigator from "./genomeNavigator/GenomeNavigator";
import { connect } from "react-redux";
import TrackModel from "model/TrackModel";

interface StateSyncSettingsProps {
    actionCreators: any;
}

function StateSyncSettings(props: StateSyncSettingsProps) {
    const { actionCreators } = props;

    return (
        <div>
            <h5>State Sync Settings</h5>
        </div>
    )
}

interface GenomeProps {
    stateIdx: number;
    cdata: SyncedContainer;
    layoutModel: Model;
    viewer3dNumFrames: any;
    isThereG3dTrack: boolean;
    isShowingNavigator: boolean;
    onSetAnchors3d: (anchors: any) => void;
    onSetGeneFor3d: (gene: any) => void;
    onSetImageInfo: (info: any) => void;

    // redux actions
    onSetHighlights: ( highlights: HighlightInterval[], genomeIdx?: number) => void;
    onSetViewRegion: (newStart: number, newEnd: number) => void;
    onTracksChanged: ( tracks: TrackModel[], genomeIdx?: number) => void;
    onMetadataTermsChanged: ( terms: string[], genomeIdx?: number) => void;
}

function _ContainerView(props: GenomeProps) {
    const {
        stateIdx,
        cdata,
        layoutModel,
        viewer3dNumFrames,
        isThereG3dTrack,
        isShowingNavigator,
        onSetAnchors3d,
        onSetGeneFor3d,
        onSetImageInfo,

        onSetHighlights,
        onSetViewRegion,
        onTracksChanged,
        onMetadataTermsChanged,
    } = props;
    const { title, genomes, viewRegion, metadataTerms, regionSets, regionSetView, trackLegendWidth, highlights } = cdata;

    const [highlightColor, setHighlightColor] = useState("rgba(255, 255, 0, 0.3)");
    const [highlightEnteredRegion, setHighlightEnteredRegion] = useState(true);
    const [regionExpanders, setRegionExpanders] = useState<RegionExpander[]>(new Array(genomes.length).fill(new RegionExpander(1)));
    const [suggestedMetaSets, setSuggestedMetaSets] = useState(new Set(["Track type"]));

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
                    <h5>{g.title}</h5>
                    <TrackContainer
                        key={gIdx}
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
                    />
                </div>
            );
        });
    };

    return (
        <div>
            {isShowingNavigator && (
                <GenomeNavigator selectedRegion={viewRegion} onRegionSelected={onSetViewRegion} genomeConfig={genomeConfigs[0]} /> // TODO: either create a switch that allows use of genomeConfig of choice or overlays all of the genomes configs in different colors.
            )}
            {renderGenomes()}
        </div>
    )
}

const mapDispatchToPropsFactory = (dispatch: Dispatch<Action>, ownProps: GenomeProps) => {
    const specializedActionCreators = GenomeActionsCreatorsFactory(ownProps.stateIdx);
    return {
        onSetHighlights: (highlights: HighlightInterval[], genomeIdx?: number) => dispatch(specializedActionCreators.setHighlights(highlights, genomeIdx)),
        onSetViewRegion: (newStart: number, newEnd: number) => dispatch(specializedActionCreators.setViewRegion(newStart, newEnd)),
        onTracksChanged: (newTracks: TrackModel[], genomeIdx?: number) => dispatch(specializedActionCreators.setTracks(newTracks, genomeIdx)),
        onMetadataTermsChanged: (newTerms: string[], genomeIdx?: number) => dispatch(specializedActionCreators.setMetadataTerms(newTerms, genomeIdx)),
    }
}

const ContainerView = connect(
    null,
    mapDispatchToPropsFactory
)(_ContainerView);

export default ContainerView;