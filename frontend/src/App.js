import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { ActionCreators } from './AppState';

import GenomePicker from './components/GenomePicker';
import GenomeNavigator from './components/genomeNavigator/GenomeNavigator';
import TrackContainer from './components/trackContainers/TrackContainer';
import withCurrentGenome from './components/withCurrentGenome';
import { BrowserScene } from './components/vr/BrowserScene';
import ErrorBoundary from './components/ErrorBoundary';

import DisplayedRegionModel from './model/DisplayedRegionModel';
import TrackModel from './model/TrackModel';

import Nav from './components/Nav';

import { withSettings } from './components/Settings';

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
};

const withAppState = connect(mapStateToProps, callbacks);
const withEnhancements = _.flowRight(withAppState, withCurrentGenome, withSettings);

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
        // this.state = {
        //     isShowing3D: false,
        //     isShowingNavigator: true,
        // };
        this.addTracks = this.addTracks.bind(this);
        this.removeTrack = this.removeTrack.bind(this);
    }

    addTracks(tracks) {
        const newTracks = this.props.tracks.concat(tracks);
        this.props.onTracksChanged(newTracks);
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
            <Nav 
                selectedRegion={viewRegion} 
                onRegionSelected={onNewViewRegion} 
                tracks={tracks}
                genomeConfig={genomeConfig}
                onTracksAdded={this.addTracks}
                onTrackRemoved={this.removeTrack}
            />
            <GenomeNavigator selectedRegion={viewRegion} onRegionSelected={onNewViewRegion} />
            {
            this.props.settings.isShowing3D &&
                <ErrorBoundary><BrowserScene viewRegion={viewRegion} tracks={tracks} /></ErrorBoundary>
            }
            <TrackContainer />
        </div>
        );
    }
}

export default withEnhancements(App);
