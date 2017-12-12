import React from 'react';
import _ from 'lodash';

import GenomeNavigator from './components/genomeNavigator/GenomeNavigator';
import TrackContainer from './components/TrackContainer';
import TrackManager from './components/trackManagers/TrackManager';

import TrackModel from './model/TrackModel';
import DisplayedRegionModel from './model/DisplayedRegionModel';
import NavigationContext from './model/NavigationContext';

import './App.css';

import Perf from 'react-addons-perf';
window.Perf = Perf;

const CHROMOSOMES = [
    {name: "chr1", lengthInBases: 249250621},
    {name: "chr2", lengthInBases: 243199373},
    {name: "chr3", lengthInBases: 198022430},
    {name: "chr4", lengthInBases: 191154276},
    {name: "chr5", lengthInBases: 180915260},
    {name: "chr6", lengthInBases: 171115067},
    {name: "chr7", lengthInBases: 159138663},
    {name: "chrY", lengthInBases: 59373566},
];
const DEFAULT_SELECTED_REGION = [15599999, 16000000];
const DEFAULT_NAV_VIEW = [0, 20000000];

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

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRegionModel: new DisplayedRegionModel(new NavigationContext("Wow very genome", CHROMOSOMES)),
            currentTracks: DEFAULT_TRACKS.slice()
        };
        // TODO set the selected region dynamically.  Don't want it outside the genome.
        this.state.selectedRegionModel.setRegion(...DEFAULT_SELECTED_REGION);

        // TODO this can be set dynamically too.
        this.initNavModel = new DisplayedRegionModel(new NavigationContext("Wow very genome", CHROMOSOMES));
        this.initNavModel.setRegion(...DEFAULT_NAV_VIEW);

        this.regionSelected = this.regionSelected.bind(this);
        this.addTrack = this.addTrack.bind(this);
        this.removeTrack = this.removeTrack.bind(this);
        this.trackChanged = this.trackChanged.bind(this);
    }

    regionSelected(start, end) {
        let modelCopy = _.cloneDeep(this.state.selectedRegionModel);
        modelCopy.setRegion(start, end);
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

    render() {
        return (
        <div>
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
        </div>
        );
    }
}

export default App;
