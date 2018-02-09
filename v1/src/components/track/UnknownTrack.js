import React from 'react';
import TrackLegend from './TrackLegend';

function UnknownVisualizer(props) {
    return (
    <div style={{textAlign: "center", width: props.width}} >
        {`Unknown track type: "${props.trackModel.getType()}"`}
    </div>
    );
}

const UnknownTrack = {
    visualizer: UnknownVisualizer
};

export default UnknownTrack;
