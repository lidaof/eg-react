import React, { useState, useMemo } from "react";
import { GenomeActionsCreatorsFactory } from "AppState";
import Nav from "./Nav";
import TrackContainer from './trackContainers/TrackContainer';

interface StateSyncSettingsProps {
    actionCreators: any;
}

function StateSyncSettings(props:StateSyncSettingsProps) {
    const { actionCreators } = props;

    return (
        <div>
            
        </div>
    )
}

interface GenomeProps {
    stateIdx: number;
    // navProps: object;
    trackContainerProps: object;
}

function Genome(props: GenomeProps) {
    const { stateIdx, trackContainerProps } = props;

    const actionCreators = useMemo(() => GenomeActionsCreatorsFactory(stateIdx), [stateIdx])

    return (
        <>
            <h1>{`State Index: ${stateIdx}`}</h1>
            {/* <Nav {...navProps} /> */}
            <TrackContainer {...trackContainerProps} />
        </>
    )
}

export default Genome;