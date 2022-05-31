import React, { useState, useMemo } from "react";
import { GenomeActionsCreatorsFactory, GenomeState, SyncedContainer } from "AppState";
import TrackContainer from './trackContainers/TrackContainer';
import { RegionExpander } from "model/RegionExpander";
import { GenomeConfig } from "model/genomes/GenomeConfig";
import { getGenomeConfig } from "model/genomes/allGenomes";
import { Model } from "flexlayout-react";
import { HighlightInterval } from "./trackContainers/HighlightMenu";
import GenomeNavigator from "./genomeNavigator/GenomeNavigator";

interface StateSyncSettingsProps {
    actionCreators: any;
}

function StateSyncSettings(props: StateSyncSettingsProps) {
    const { actionCreators } = props;

    return (
        <div>

        </div>
    )
}

interface GenomeProps {
    stateIdx: number;
    cdata: SyncedContainer;

    layoutModel: Model;
    onSetAnchors3d: (anchors: any) => void;
    onSetGeneFor3d: (gene: any) => void;
    viewer3dNumFrames: any;
    isThereG3dTrack: boolean;
    onSetImageInfo: (info: any) => void;
    isShowingNavigator: boolean;
}

function ContainerView(props: GenomeProps) {
    const { stateIdx, cdata, layoutModel, onSetAnchors3d, onSetGeneFor3d, viewer3dNumFrames, isThereG3dTrack, onSetImageInfo, isShowingNavigator } = props;
    const { title, genomes, viewRegion, metadataTerms, regionSets, regionSetView, trackLegendWidth, highlights } = cdata;

    // state that is local to the container and dictates what all of the track containers would behave like. 
    // this was local to the original app component.
    // why isn't it moved to global state?
    const [highlightColor, setHighlightColor] = useState("rgba(255, 255, 0, 0.3)");
    const [highlightEnteredRegion, setHighlightEnteredRegion] = useState(true);
    const [regionExpanders, setRegionExpanders] = useState<RegionExpander[]>(new Array(genomes.length).fill(new RegionExpander(1)));
    const [suggestedMetaSets, setSuggestedMetaSets] = useState(new Set(["Track type"]));

    const specializedActionCreators = useMemo(() => GenomeActionsCreatorsFactory(stateIdx), [stateIdx]);
    const { setHighlights: onSetHighlights, setViewRegion: onNewViewRegion } = specializedActionCreators;
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
            return (
                <>
                    <h5>{g.title}</h5>
                    <TrackContainer
                        key={idx}
                        enteredRegion={null}
                        highlightColor={highlightColor}
                        highlightEnteredRegion={highlightEnteredRegion}
                        expansionAmount={regionExpanders[idx]}
                        suggestedMetaSets={suggestedMetaSets}
                        genomeConfig={genomeConfigs[idx]}
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
                    />
                </>
            );
        })
    };

    return (
        <div>
            <h5>{`State Index: ${stateIdx}`}</h5>
            {isShowingNavigator && (
                <GenomeNavigator selectedRegion={viewRegion} onRegionSelected={onNewViewRegion} genomeConfig={genomeConfigs[0]} /> // TODO: either create a switch that allows use of genomeConfig of choice or overlays all of the genomes configs in different colors.
            )}
            {renderGenomes()}
        </div>
    )
}

export default ContainerView;