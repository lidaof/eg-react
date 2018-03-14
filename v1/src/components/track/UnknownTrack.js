import React from 'react';
import TrackLegend from './TrackLegend';
import withAutoDimensions from '../withAutoDimensions';

/**
 * A placeholder when we don't recognize a track's type.  It basically does nothing.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} - element to render
 * @author Silas Hsu
 */
function UnknownVisualizer(props) {
    return (
    <div style={{textAlign: "center", width: props.width}} >
        {`Unknown track type: "${props.trackModel.type}"`}
    </div>
    );
}

const UnknownTrack = {
    visualizer: UnknownVisualizer,
    legend: withAutoDimensions(TrackLegend),
};

export default UnknownTrack;
