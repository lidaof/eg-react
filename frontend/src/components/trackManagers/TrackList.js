import PropTypes from 'prop-types';
import React from 'react';

import './TrackList.css';

/**
 * A complete list of tracks
 * 
 */

/**
 * All the UI for managing tracks: adding them, deleting them, looking at what tracks are available, etc.
 * 
 * @author Daofeng modified from Silas Hsu's TrackManager
 */
class TrackList extends React.Component {
    static propTypes = {
        addedTracks: PropTypes.arrayOf(PropTypes.object),
        onTrackAdded: PropTypes.func,
        onTrackRemoved: PropTypes.func
    };

    static defaultProps = {
        onTrackAdded: () => undefined,
        onTrackRemoved: () => undefined,
    };

    constructor(props) {
        super(props);
    }

   
    /**
     * 
     * @return {JSX.Element} the element to render
     * @override
     */
    render() {
        const {addedTracks, onTrackRemoved} = this.props;
        const currentTrackList = addedTracks.map((track, index) => (
            <li key={index}>
                {track.getDisplayLabel()}
                <span className="btn btn-link TrackList-remove-track-button" onClick={() => onTrackRemoved(index)} >✘</span>
            </li>
            )
        );
        
        return (
        <div className="TrackList-parent">
            <div className="TrackList-sidebar">
                <h3>Current tracks</h3>
                <ul className="TrackList-tracklist">{currentTrackList}</ul>
            </div>
        </div>);
    }
}

export default TrackList;
