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
    onSetHighlights: (highlights: HighlightInterval[]) => void;
    onSetViewRegion: (newStart: number, newEnd: number) => void;
    onTracksChanged: (genomeIdx: number, tracks: TrackModel[]) => void;
    onMetadataTermsChanged: (genomeIdx: number, terms: string[]) => void;
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

    // state that is local to the container and dictates what all of the track containers would behave like. 
    // this was local to the original app component.
    // why isn't it moved to global state?
    const [highlightColor, setHighlightColor] = useState("rgba(255, 255, 0, 0.3)");
    const [highlightEnteredRegion, setHighlightEnteredRegion] = useState(true);
    const [regionExpanders, setRegionExpanders] = useState<RegionExpander[]>(new Array(genomes.length).fill(new RegionExpander(1)));
    const [suggestedMetaSets, setSuggestedMetaSets] = useState(new Set(["Track type"]));

    const genomeConfigs: GenomeConfig[] = useMemo(() => genomes.map(g => {
        return g.genomeConfig || getGenomeConfig(g.name);
    }), [genomes]);

    const newHighlight = (start: number, end: number, tag: string = '') => {
        const interval = new HighlightInterval(start, end, tag);
        const existing = highlights.find(h => h.start === start && h.end === end)
        if (!existing) {
            onSetHighlights([...highlights, interval]);
        }
    }

    const renderGenomes = () => {
        return genomes.map((g, idx) => {
            const genomeConfig = genomeConfigs[idx];
            return (
                <div key={idx}>
                    <h5>{g.title}</h5>
                    <TrackContainer
                        key={idx}
                        enteredRegion={null}
                        highlightColor={highlightColor}
                        highlightEnteredRegion={highlightEnteredRegion}
                        expansionAmount={regionExpanders[idx]}
                        suggestedMetaSets={suggestedMetaSets}
                        genomeConfig={genomeConfig}
                        tracks={g.tracks.filter(tk => tk.type !== "g3d")}
                        layoutModel={layoutModel}
                        onSetAnchors3d={onSetAnchors3d}
                        onSetGeneFor3d={onSetGeneFor3d}
                        viewer3dNumFrames={viewer3dNumFrames}
                        isThereG3dTrack={isThereG3dTrack}
                        onSetImageInfo={onSetImageInfo}
                        onNewHighlight={newHighlight}
                        highlights={highlights}
                        onSetHighlights={onSetHighlights}
                        
                        childProps={{
                            genome: g.name,
                            viewRegion: viewRegion,
                            metadataTerms: metadataTerms,
                        }}
                        
                        viewRegion={viewRegion}

                        // formerly connected through redux
                        onNewRegion={onSetViewRegion}
                        onTracksChanged={(newTracks: TrackModel[]) => onTracksChanged(idx, newTracks)}
                        onMetadataTermsChanged={(newTerms: string[]) => onMetadataTermsChanged(idx, newTerms)}
                    />
                </div>
            );
        })
    };

    return (
        <div>
            <p>{`State Index: ${stateIdx}`}</p>
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
        onSetHighlights: (highlights: HighlightInterval[]) => dispatch(specializedActionCreators.setHighlights(highlights)),
        onSetViewRegion: (newStart: number, newEnd: number) => dispatch(specializedActionCreators.setViewRegion(newStart, newEnd)),
        onTracksChanged: (genomeIdx: number, newTracks: TrackModel[]) => dispatch(specializedActionCreators.setTracks(genomeIdx, newTracks)),
        onMetadataTermsChanged: (genomeIdx: number, newTerms: string[]) => dispatch(specializedActionCreators.setMetadataTerms(genomeIdx, newTerms)),
    }
}

const ContainerView = connect(
    null,
    mapDispatchToPropsFactory
)(_ContainerView);

export default ContainerView;