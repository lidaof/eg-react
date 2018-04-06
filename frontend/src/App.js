import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ActionCreators } from './AppState';

import GenomePicker from './components/GenomePicker';
import GenomeNavigator from './components/genomeNavigator/GenomeNavigator';
import TrackContainer from './components/trackContainers/TrackContainer';
import TrackManager from './components/trackManagers/TrackManager';
import RegionSetSelector from './components/RegionSetSelector';
import withCurrentGenome from './components/withCurrentGenome';

import DisplayedRegionModel from './model/DisplayedRegionModel';
import TrackModel from './model/TrackModel';

import './App.css';

function mapStateToProps(state) {
    return {
        viewRegion: state.viewRegion,
        tracks: state.tracks,
    };
}

const callbacks = {
    onNewViewRegion: ActionCreators.setViewRegion,
    onTracksChanged: ActionCreators.setTracks,
}

class App extends React.Component {
    static propTypes = {
        genomeConfig: PropTypes.object,
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel),
        tracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)),
        onNewViewRegion: PropTypes.func,
        onTracksChanged: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.addTrack = this.addTrack.bind(this);
        this.removeTrack = this.removeTrack.bind(this);
    }

    addTrack(track) {
        let tracks = this.props.tracks.slice();
        tracks.push(track);
        this.props.onTracksChanged(tracks);
    }

    removeTrack(indexToRemove) {
        let newTracks = this.props.tracks.filter((track, index) => index !== indexToRemove);
        this.props.onTracksChanged(newTracks);
    }

    render() {
        const {genomeConfig, viewRegion, tracks, onNewViewRegion} = this.props;
        if (!genomeConfig) {
            return <div className="container-fluid"><GenomePicker /></div>;
        }

        return (
        <div className="container-fluid">
            <GenomeNavigator selectedRegion={viewRegion} onRegionSelected={onNewViewRegion} />
            <TrackContainer />
            <TrackManager
                addedTracks={tracks}
                onTrackAdded={this.addTrack}
                onTrackRemoved={this.removeTrack}
            />
            <RegionSetSelector genome={genomeConfig.genome} />
        </div>
        );
    }
}

export default connect(mapStateToProps, callbacks)(withCurrentGenome(App));
