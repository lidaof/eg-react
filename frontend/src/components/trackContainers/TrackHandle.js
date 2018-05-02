import React from 'react';
import Reparentable from '../Reparentable';
import TrackErrorBoundary from './TrackErrorBoundary';
import { getSubtypeConfig } from '../track/subtypeConfig';

/**
 * Renders a track subtype wrapped in necessary components, such as an error boundary.  All props passed to this
 * component are passed to the track subtype.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} - track element
 */
function TrackHandle(props) {
    const {trackModel, index, onContextMenu, onClick} = props;
    const TrackSubtype = getSubtypeConfig(trackModel).component;
    return (
    <Reparentable uid={"track-" + trackModel.getId()} >
        <TrackErrorBoundary
            trackModel={trackModel}
            index={index}
            onContextMenu={onContextMenu}
            onClick={onClick}
        >
            <TrackSubtype {...props} />
        </TrackErrorBoundary>
    </Reparentable>
    );
}

export default TrackHandle;
