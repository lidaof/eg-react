import React, { useState } from "react";
import Nav from "./Nav";
import TrackContainer from './trackContainers/TrackContainer';

interface GenomeProps {
    stateIdx: number;
    // navProps: object;
    trackContainerProps: object;
}

function Genome(props: GenomeProps) {
    const { stateIdx, trackContainerProps } = props;
    return (
        <>
            <h1>{`State Index: ${stateIdx}`}</h1>
            {/* <Nav {...navProps} /> */}
            <TrackContainer {...trackContainerProps} />
        </>
    )
}

export default Genome;