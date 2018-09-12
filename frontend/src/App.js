import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ActionCreators } from './AppState';
import GenomePicker from './components/GenomePicker';
import Nav from './components/Nav';
import GenomeNavigator from './components/genomeNavigator/GenomeNavigator';
import TrackContainer from './components/trackContainers/TrackContainer';
import withCurrentGenome from './components/withCurrentGenome';
import { BrowserScene } from './components/vr/BrowserScene';
import ErrorBoundary from './components/ErrorBoundary';
import DisplayedRegionModel from './model/DisplayedRegionModel';
import TrackModel from './model/TrackModel';
import Notifications from 'react-notify-toast';
import LoadSession from './components/LoadSession';

import './App.css';

function mapStateToProps(state) {
    return {
        viewRegion: state.browser.present.viewRegion,
        tracks: state.browser.present.tracks,
        bundleId: state.browser.present.bundleId,
        sessionFromUrl: state.browser.present.sessionFromUrl,
    };
}

const callbacks = {
    onNewViewRegion: ActionCreators.setViewRegion,
    onTracksChanged: ActionCreators.setTracks,
};


const withAppState = connect(mapStateToProps, callbacks);
const withEnhancements = _.flowRight(withAppState, withCurrentGenome);

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
        this.state = {
            isShowing3D: false,
            isShowingNavigator: true,
            highlightEnteredRegion: true,
        };
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

    toggleNavigator = () => {
        this.setState(prevState => {return {isShowingNavigator: !prevState.isShowingNavigator}});
    };

    toggle3DScene = () => {
        this.setState(prevState => {return {isShowing3D: !prevState.isShowing3D}});
    };

    toggleHighlight = () => {
        this.setState(prevState => {return {highlightEnteredRegion: !prevState.highlightEnteredRegion}});
    };    

    render() {
        const {genomeConfig, viewRegion, tracks, onNewViewRegion, bundleId, sessionFromUrl} = this.props;
        if (sessionFromUrl) {
            return <div className="container-fluid"><LoadSession bundleId={bundleId} /></div>;
        }
        if (!genomeConfig) {
            return <div className="container-fluid"><GenomePicker /></div>;
        }

        return (
        <div className="App container-fluid">
            <Nav
                {...this.state}
                onToggleNavigator={this.toggleNavigator}
                onToggle3DScene={this.toggle3DScene}
                onToggleHighlight={this.toggleHighlight}
                selectedRegion={viewRegion}
                onRegionSelected={onNewViewRegion} 
                tracks={tracks}
                genomeConfig={genomeConfig}
                onTracksAdded={this.addTracks}
                onTrackRemoved={this.removeTrack}
                bundleId={bundleId}
            />
             <Notifications />
            {this.state.isShowingNavigator &&
                <GenomeNavigator selectedRegion={viewRegion} onRegionSelected={onNewViewRegion} />
            }
            {
            this.state.isShowing3D &&
                <ErrorBoundary><BrowserScene viewRegion={viewRegion} tracks={tracks} /></ErrorBoundary>
            }
            <TrackContainer />
        </div>
        );
    }
}

export default withEnhancements(App);
