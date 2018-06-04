import React from 'react';

/**
 * A notice that a track is loading data.
 * 
 * @param {Object} props - props as specified by React
 */
function TrackLoadingNotice(props) {
    const style = {
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        textAlign: "center",
        opacity: 0.5,
        zIndex: 1,
    }
    return <div style={style} />;
}

export default TrackLoadingNotice;
