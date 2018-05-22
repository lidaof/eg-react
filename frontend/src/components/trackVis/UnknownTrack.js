import React from 'react';
import Track from './commonComponents/Track';
import TrackLegend from './commonComponents/TrackLegend';
import withAutoDimensions from '../withAutoDimensions';
import ErrorMessage from '../ErrorMessage';

const AutoDimensionLegend = withAutoDimensions(TrackLegend);

/**
 * A placeholder when we don't recognize a track's type.  It basically does nothing.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} track to render
 * @author Silas Hsu
 */
function UnknownTrack(props) {
    const {width, trackModel} = props;
    const message = `Unknown track type: "${trackModel.type}"`;
    return <Track 
        {...props}
        legend={<AutoDimensionLegend trackModel={trackModel} />}
        visualizer={<ErrorMessage width={width} >{message}</ErrorMessage>}
    />;
}

export default UnknownTrack;
