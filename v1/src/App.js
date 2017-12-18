import React from 'react';

import GenomeNavigator from './components/genomeNavigator/GenomeNavigator';
import TrackContainer from './components/TrackContainer';
import TrackManager from './components/trackManagers/TrackManager';

import TrackModel from './model/TrackModel';
import DisplayedRegionModel from './model/DisplayedRegionModel';
import NavigationContext from './model/NavigationContext';
import GenomeCoordinateMap from './model/GenomeCoordinateMap';

import './App.css';

import Perf from 'react-addons-perf';
if (process.env.NODE_ENV === 'development') {
    window.Perf = Perf;
}

const CHROMOSOMES = [
    {name: "chr1", lengthInBases: 249250621},
    {name: "chr2", lengthInBases: 243199373},
    {name: "chr3", lengthInBases: 198022430},
    {name: "chr4", lengthInBases: 191154276},
    {name: "chr5", lengthInBases: 180915260},
    {name: "chr6", lengthInBases: 171115067},
    {name: "chr7", lengthInBases: 159138663},
    {name: "chr8", lengthInBases: 146364022},
    {name: "chr9", lengthInBases: 141213431},
    {name: "chr10", lengthInBases: 135534747},
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

const HG19 = new NavigationContext("Wow very genome", CHROMOSOMES);

const GENES = [
    {name: "CYP2C8", chr: "chr10", start: 96796528, end: 96829254, lengthInBases: 32726}, 
    {name: "CYP4B1", chr: "chr1", start: 47223509, end: 47276522, lengthInBases: 53013},
    {name: "CYP11B2", chr: "chr8", start: 143991974, end: 143999259, lengthInBases: 7285},
    {name: "CYP26B1", chr: "chr2", start: 72356366, end: 72375167, lengthInBases: 18801},
    {name: "CYP51A1", chr: "chr7", start: 91741462, end: 91764059, lengthInBases: 22597}
];

const COOR_LOOKUP = new GenomeCoordinateMap(GENES, HG19);

const GENE_SET = new NavigationContext("Set of 5 genes", GENES, COOR_LOOKUP);

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // TODO set the selected region dynamically
            selectedRegionModel: new DisplayedRegionModel(HG19, ...DEFAULT_SELECTED_REGION),
            currentTracks: DEFAULT_TRACKS.slice(),
            isGeneSetView: false,
        };

        // TODO this can be set dynamically too.
        this.initNavModel = new DisplayedRegionModel(HG19, ...DEFAULT_NAV_VIEW);

        this.regionSelected = this.regionSelected.bind(this);
        this.addTrack = this.addTrack.bind(this);
        this.removeTrack = this.removeTrack.bind(this);
        this.trackChanged = this.trackChanged.bind(this);
        this.toggleGeneSetView = this.toggleGeneSetView.bind(this);
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

    toggleGeneSetView() {
        const nextContext = this.state.isGeneSetView ? HG19 : GENE_SET;
        this.initNavModel = new DisplayedRegionModel(nextContext, ...DEFAULT_NAV_VIEW);
        this.setState({
            selectedRegionModel: new DisplayedRegionModel(nextContext, ...DEFAULT_SELECTED_REGION),
            isGeneSetView: !this.state.isGeneSetView
        });
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
            {
            this.state.isGeneSetView ?
                <button onClick={this.toggleGeneSetView}>Exit gene set view</button> :
                <button onClick={this.toggleGeneSetView}>Gene set view!</button>
            }
        </div>
        );
    }
}

export default App;
