import React from 'react';

import GenomeNavigator from './components/genomeNavigator/GenomeNavigator';
import TrackContainer from './components/TrackContainer';
import TrackManager from './components/trackManagers/TrackManager';

import { HG19 } from './model/Genome';
import ChromosomeInterval from './model/interval/ChromosomeInterval';
import Feature from './model/Feature';
import TrackModel from './model/TrackModel';
import DisplayedRegionModel from './model/DisplayedRegionModel';
import NavigationContext from './model/NavigationContext';

import './App.css';

import Perf from 'react-addons-perf';

if (process.env.NODE_ENV === 'development') {
    window.Perf = Perf;
}

const DEFAULT_SELECTED_REGION = [15600000, 16000000];
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

const HG19_CONTEXT = HG19.makeNavContext();

const GENES = [
    new Feature("CYP2C8", new ChromosomeInterval("chr10", 96796528, 96829254)),
    new Feature("CYP4B1", new ChromosomeInterval("chr1", 47223509, 47276522)),
    new Feature("CYP11B2", new ChromosomeInterval("chr8", 143991974, 143999259)),
    new Feature("CYP26B1", new ChromosomeInterval("chr2", 72356366, 72375167)),
    new Feature("CYP51A1", new ChromosomeInterval("chr7", 91741462, 91764059)),
];
const GENE_SET = new NavigationContext("Set of 5 genes", GENES);

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
        this.initNavModel = new DisplayedRegionModel(HG19_CONTEXT, ...DEFAULT_NAV_VIEW);

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
        const nextContext = this.state.isGeneSetView ? HG19_CONTEXT : GENE_SET;
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
