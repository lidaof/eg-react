import React from 'react';

import GenomeNavigator from './components/genomeNavigator/GenomeNavigator';
import TrackContainer from './components/TrackContainer';
import TrackManager from './components/trackManagers/TrackManager';
import RegionSetSelector from './components/RegionSetSelector';

import { HG19 } from './model/Genome';
import TrackModel from './model/TrackModel';
import DisplayedRegionModel from './model/DisplayedRegionModel';

import './App.css';

import Perf from 'react-addons-perf';

if (process.env.NODE_ENV === 'development') {
    window.Perf = Perf;
}

const DEFAULT_SELECTED_REGION = [15600000, 16000000];

const DEFAULT_TRACKS = [
    new TrackModel({
        type: "bigwig",
        name: "GSM429321.bigWig",
        url: "http://vizhub.wustl.edu/hubSample/hg19/GSM429321.bigWig",
    }),
    new TrackModel({
        type: "hammock",
        name: "refGene",
        url: 'http://egg.wustl.edu/d/hg19/refGene.gz',
    }),
];

const HG19_CONTEXT = HG19.makeNavContext();

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // TODO set the selected region dynamically
            selectedRegionModel: new DisplayedRegionModel(HG19_CONTEXT, ...DEFAULT_SELECTED_REGION),
            currentTracks: DEFAULT_TRACKS.slice(),
            isGeneSetView: false,
        };

        // TODO this can be set dynamically too.
        this.initNavModel = new DisplayedRegionModel(HG19_CONTEXT);

        this.regionSelected = this.regionSelected.bind(this);
        this.addTrack = this.addTrack.bind(this);
        this.removeTrack = this.removeTrack.bind(this);
        this.trackChanged = this.trackChanged.bind(this);
        this.setRegionSet = this.setRegionSet.bind(this);
    }

    regionSelected(start, end) {
        let modelCopy = this.state.selectedRegionModel.clone().setRegion(start, end);
        this.setState({selectedRegionModel: modelCopy});
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
            this.initNavModel = new DisplayedRegionModel(HG19_CONTEXT);
            this.setState({selectedRegionModel: new DisplayedRegionModel(HG19_CONTEXT, ...DEFAULT_SELECTED_REGION)});
        } else {
            const selectedRegion = new DisplayedRegionModel(set.makeNavContext());
            this.initNavModel = selectedRegion;
            this.setState({selectedRegionModel: selectedRegion});
        }
    }

    render() {
        return (
        <div className="container-fluid">
            <GenomeNavigator
                viewModel={this.initNavModel}
                selectedRegionModel={this.state.selectedRegionModel}
                regionSelectedCallback={this.regionSelected}
            />
            <TrackContainer
                viewRegion={this.state.selectedRegionModel}
                newRegionCallback={this.regionSelected}
                tracks={this.state.currentTracks}
            />
            <TrackManager
                addedTracks={this.state.currentTracks}
                onTrackAdded={this.addTrack}
                onTrackRemoved={this.removeTrack}
            />
            {
            this.state.selectedRegionModel.getNavigationContext() !== HG19_CONTEXT ?
                <button onClick={() => this.setRegionSet(null)} >Exit gene set view</button>
                :
                null
            }
            <RegionSetSelector genome={HG19} onSetSelected={this.setRegionSet}/>
        </div>
        );
    }
}

export default App;
