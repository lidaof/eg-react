import React, { useState, useMemo } from "react";
import { GenomeActionsCreatorsFactory, GenomeState, SyncedContainer } from "AppState";
import TrackContainer from './trackContainers/TrackContainer';
import { RegionExpander } from "model/RegionExpander";
import { GenomeConfig } from "model/genomes/GenomeConfig";
import { getGenomeConfig } from "model/genomes/allGenomes";
import { Model } from "flexlayout-react";

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
}

function ContainerView(props: GenomeProps) {
    const { stateIdx, cdata } = props;
    const { title, genomes, viewRegion, metadataTerms, regionSets, regionSetView, trackLegendWidth, highlights } = cdata;

    // state that is local to the container and dictates what all of the track containers would behave like. 
    // this was local to the original app component.
    // why isn't it moved to global state?
    const [highlightColor, setHighlightColor] = useState("rgba(255, 255, 0, 0.3)");
    const [highlightEnteredRegion, setHighlightEnteredRegion] = useState(true);
    const [regionExpanders, setRegionExpanders] = useState<RegionExpander[]>(new Array(genomes.length).fill(new RegionExpander(1)));
    const [suggestedMetaSets, setSuggestedMetaSets] = useState(new Set(["Track type"]));
    
    const specializedActionCreators = useMemo(() => GenomeActionsCreatorsFactory(stateIdx), [stateIdx]);
    const genomeConfigs: GenomeConfig[] = useMemo(() => genomes.map(g => {
        return g.genomeConfig || getGenomeConfig(g.name);
    }), [genomes])

    const renderGenomes = () => {
        genomes.map((g, idx) => (
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
                    
                    
                    viewRegion={viewRegion}
                />
            </>
        ))
    };

    return (
        <div>
            <h5>{`State Index: ${stateIdx}`}</h5>
            {renderGenomes()}
        </div>
    )
}

export default ContainerView;