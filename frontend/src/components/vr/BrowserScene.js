import React from 'react';
import PropTypes from 'prop-types';
import VrRuler from './VrRuler';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';

const TRACK_SEPARATION = 1; // In meters

class BrowserScene extends React.Component {
    static propTypes = {
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // Region to render
        tracks: PropTypes.arrayOf(PropTypes.object).isRequired, // Array of React.Component to render
        trackWidth: PropTypes.number, // Meters of track to render
    };

    static defaultProps = {
        trackWidth: 100,
    }

    render() {
        let {viewRegion, tracks, trackWidth, children, ...otherProps} = this.props;
        let z = -TRACK_SEPARATION;
        const tracksAndRulers = [];
        for (let track of tracks) {
            tracksAndRulers.push(React.cloneElement(track, {z: z, width: trackWidth}));
            tracksAndRulers.push(<VrRuler key={track.key + "ruler"} viewRegion={viewRegion} z={z} width={trackWidth}/>);
            z -= TRACK_SEPARATION;
        }

        return (
        <a-scene {...otherProps} >
            <a-sky color="#ECECEC"></a-sky>
            {children}
            {tracksAndRulers}
        </a-scene>
        );
    }
}

export default BrowserScene;
