import './App.css';
import DisplayedRegionModel from './model/DisplayedRegionModel';
import GenomeNavigator from './components/genomeNavigator/GenomeNavigator';
import React from 'react';
import TrackContainer from './components/TrackContainer';
import _ from 'lodash';

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

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRegionModel: new DisplayedRegionModel("Wow very genome", CHROMOSOMES),
        };
        // TODO set the selected region dynamically.  Don't want it outside the genome.
        this.state.selectedRegionModel.setRegion(...DEFAULT_SELECTED_REGION);

        this.regionSelected = this.regionSelected.bind(this);
    }

    regionSelected(start, end) {
        let modelCopy = _.cloneDeep(this.state.selectedRegionModel);
        modelCopy.setRegion(start, end, true);
        this.setState({selectedRegionModel: modelCopy});
    }

    render() {
        return (
        <div>
            <GenomeNavigator
                chromosomes={CHROMOSOMES}
                selectedRegionModel={this.state.selectedRegionModel}
                regionSelectedCallback={this.regionSelected}
            />
            <TrackContainer
                viewRegion={this.state.selectedRegionModel}
                newRegionCallback={this.regionSelected}
            />
        </div>
        );
    }
}

export default App;
