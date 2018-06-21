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
import { BrowserScene } from './components/vr/BrowserScene';
import ErrorBoundary from './components/ErrorBoundary';

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
        this.state = {
            isShowingRegionSetUI: false,
            isShowing3D: true
        };
        this.addTracks = this.addTracks.bind(this);
        this.removeTrack = this.removeTrack.bind(this);
        this.toggleRegionSetUI = this.toggleRegionSetUI.bind(this);
        this.toggle3DScene = this.toggle3DScene.bind(this);
    }

    addTracks(tracks) {
        const newTracks = this.props.tracks.concat(tracks);
        this.props.onTracksChanged(newTracks);
    }

    removeTrack(indexToRemove) {
        let newTracks = this.props.tracks.filter((track, index) => index !== indexToRemove);
        this.props.onTracksChanged(newTracks);
    }

    toggleRegionSetUI() {
        this.setState(prevState => {return {isShowingRegionSetUI: !prevState.isShowingRegionSetUI}});
    }

    toggle3DScene() {
        this.setState(prevState => {return {isShowing3D: !prevState.isShowing3D}});
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
                onTracksAdded={this.addTracks}
                onTrackRemoved={this.removeTrack}
            />
            <hr/>
            <div>
                <span style={{marginRight: "1ch"}} >Show region set config</span>
                <input type="checkbox" checked={this.state.isShowingRegionSetUI} onChange={this.toggleRegionSetUI} />
            </div>
            <div>
                <span style={{marginRight: "1ch"}} >Show 3D scene</span>
                <input type="checkbox" checked={this.state.isShowing3D} onChange={this.toggle3DScene} />
            </div>
            {this.state.isShowingRegionSetUI ? <RegionSetSelector genome={genomeConfig.genome} /> : null}
            {
            this.state.isShowing3D &&
                <ErrorBoundary><BrowserScene viewRegion={viewRegion} tracks={tracks} /></ErrorBoundary>
            }
        </div>
        );
    }
}

export default connect(mapStateToProps, callbacks)(withCurrentGenome(App));
