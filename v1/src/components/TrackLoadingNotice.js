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
        height: props.height,
        backgroundColor: "white",
        textAlign: "center",
        opacity: 0.6,
        zIndex: 1,
    }
    return <div style={style}><h3>Loading...</h3></div>;
}

export default TrackLoadingNotice;
