import React from 'react';

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
