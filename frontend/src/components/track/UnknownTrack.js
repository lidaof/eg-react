import React from 'react';
import NewTrack from './NewTrack';
import TrackLegend from './commonComponents/TrackLegend';
import withAutoDimensions from '../withAutoDimensions';

const AutoDimensionLegend = withAutoDimensions(TrackLegend);

/**
 * Displays a simple error message.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} - element to render
 */
function UnknownVisualizer(props) {
    const message = `Unknown track type: "${props.trackModel.type}"`;
    return <div style={{textAlign: "center", width: props.width}} >{message}</div>;
}

/**
 * A placeholder when we don't recognize a track's type.  It basically does nothing.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} track to render
 * @author Silas Hsu
 */
function UnknownTrack(props) {
    const trackModel = props.trackModel;
    return <NewTrack 
        {...props}
        legendElement={<AutoDimensionLegend trackModel={trackModel} />}
        getVisualizerElement={
            (viewRegion, width, viewWindow) => <UnknownVisualizer trackModel={trackModel} width={width} />
        }
    />;
}

const UnknownTrackConfig = {
    component: UnknownTrack
};

export default UnknownTrackConfig;
