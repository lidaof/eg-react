import './App.css';
import BigWigTrack from './components/BigWigTrack';
import GeneAnnotationTrack from './components/geneAnnotationTrack/GeneAnnotationTrack';
import TrackModel from './model/TrackModel';
import DisplayedRegionModel from './model/DisplayedRegionModel';
import GenomeNavigator from './components/genomeNavigator/GenomeNavigator';
import React from 'react';
import TrackContainer from './components/TrackContainer';
import _ from 'lodash';
import TrackManager from './components/trackManagers/TrackManager';

import Perf from 'react-addons-perf'; // ES6
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
        type: BigWigTrack.TYPE_NAME,
        name: "GSM429321.bigWig",
        url: 'http://vizhub.wustl.edu/hubSample/hg19/GSM429321.bigWig',
    }),
    new TrackModel({
        type: GeneAnnotationTrack.TYPE_NAME,
        name: "refGene",
    }),
];

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRegionModel: new DisplayedRegionModel("Wow very genome", CHROMOSOMES),
            currentTracks: DEFAULT_TRACKS.slice()
        };
        // TODO set the selected region dynamically.  Don't want it outside the genome.
        this.state.selectedRegionModel.setRegion(...DEFAULT_SELECTED_REGION);

        // TODO this can be set dynamically too.
        this.initNavModel = new DisplayedRegionModel("Wow very genome", CHROMOSOMES);
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
