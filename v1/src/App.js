import React from 'react';
import PropTypes from 'prop-types';

import withCurrentGenome from './components/withCurrentGenome';

import GenomeNavigator from './components/genomeNavigator/GenomeNavigator';
import TrackContainer from './components/trackContainers/TrackContainer';
import TrackManager from './components/trackManagers/TrackManager';
import RegionSetSelector from './components/RegionSetSelector';

import HG19 from './model/genomes/hg19/hg19';
import DisplayedRegionModel from './model/DisplayedRegionModel';

import './App.css';
import GenomePicker from './components/GenomePicker';

const MIN_SELECTED_SIZE = 100;

class App extends React.Component {
    static propTypes = {
        genomeConfig: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.state = this.initGenomeConfig(props);

        this.regionSelected = this.regionSelected.bind(this);
        this.addTrack = this.addTrack.bind(this);
        this.removeTrack = this.removeTrack.bind(this);
        this.trackChanged = this.trackChanged.bind(this);
        this.setRegionSet = this.setRegionSet.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.genomeConfig !== nextProps.genomeConfig) {
            this.setState(this.initGenomeConfig(nextProps));
        }
    }

    initGenomeConfig(props) {
        const genomeConfig = props.genomeConfig;
        if (genomeConfig) {
            return {
                selectedRegion: new DisplayedRegionModel(genomeConfig.navContext, ...genomeConfig.defaultRegion),
                currentTracks: genomeConfig.defaultTracks.slice(),
            };
        } else {
            return {
                selectedRegion: null,
                currentTracks: []
            };
        }
    }

    regionSelected(start, end) {
        if (end - start < MIN_SELECTED_SIZE) {
            return;
        }
        let modelCopy = this.state.selectedRegion.clone().setRegion(start, end);
        this.setState({selectedRegion: modelCopy});
    }

    addTrack(track) {
        let tracks = this.state.currentTracks.slice();
        tracks.push(track);
        this.setState({currentTracks: tracks});
    }

    removeTrack(indexToRemove) {
        let newTracks = this.state.currentTracks.filter((track, index) => index !== indexToRemove);
        this.setState({currentTracks: newTracks});
    }

    trackChanged(index, replacementTrack) {
        let tracks = this.state.currentTracks.slice();
        tracks[index] = replacementTrack;
        this.setState({currentTracks: tracks});
    }

    setRegionSet(set) {
        if (!set) {
            this.setState({selectedRegion: new DisplayedRegionModel(HG19.context, ...HG19.defaultRegion)});
        } else {
            const selectedRegion = new DisplayedRegionModel(set.makeNavContext());
            this.setState({selectedRegion: selectedRegion});
        }
    }

    render() {
        if (!this.props.genomeConfig) {
            return <GenomePicker />;
        }

        return (
        <div className="container-fluid">
            <GenomeNavigator selectedRegion={this.state.selectedRegion} regionSelectedCallback={this.regionSelected} />
            <TrackContainer
                tracks={this.state.currentTracks}
                viewRegion={this.state.selectedRegion}
                onNewRegion={this.regionSelected}
                onTracksChanged={(newTracks) => this.setState({currentTracks: newTracks})}
            />
            <TrackManager
                addedTracks={this.state.currentTracks}
                onTrackAdded={this.addTrack}
                onTrackRemoved={this.removeTrack}
            />
            {
            this.state.selectedRegion.getNavigationContext() !== HG19.context ?
                <button onClick={() => this.setRegionSet(null)} >Exit gene set view</button>
                :
                null
            }
            <RegionSetSelector genome={HG19.genome} onSetSelected={this.setRegionSet}/>
        </div>
        );
    }
}

export default withCurrentGenome(App);
