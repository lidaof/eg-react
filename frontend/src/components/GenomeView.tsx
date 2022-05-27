import React, { useState, useMemo } from "react";
import { GenomeActionsCreatorsFactory, GenomeState, SyncedContainer } from "AppState";
import Nav from "./Nav";
import TrackContainer from './trackContainers/TrackContainer';

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

    // containerData
    cdata: SyncedContainer;
}

function ContainerView(props: GenomeProps) {
    const { stateIdx, cdata } = props;
    const { title, genomes, viewRegion, metadataTerms, regionSets, regionSetView, trackLegendWidth, highlights } = cdata;

    const [enteredRegion, setEnteredRegion] = useState(null);
    const [highlightColor, setHighlightColor] = useState("rgba(255, 255, 0, 0.3)");

    const actionCreators = useMemo(() => GenomeActionsCreatorsFactory(stateIdx), [stateIdx]);

    const renderGenomes = () => {
        genomes.map((g, idx) => (
            <>
                <h5>{g.title}</h5>
                <TrackContainer 
                    key={idx}
                    tracks={g.tracks}
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