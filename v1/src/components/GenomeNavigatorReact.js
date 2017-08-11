import React from 'react';
import SVG from 'svg.js';
import _ from 'lodash';
import DisplayedRegionModel from '../model/DisplayedRegionModel';
import GenomeNavigator from './GenomeNavigator';

class GenomeNavigatorReact extends React.Component {

    constructor(props) {
        super(props);
        // TODO the info required to make this model should be passed from the parent
        this.model = new DisplayedRegionModel("meow", [
            {name: "chr1", lengthInBases: 19432004},
            {name: "chr2", lengthInBases: 16803013},
            {name: "chr3", lengthInBases: 15030041},
            {name: "chr4", lengthInBases: 13040000},
            {name: "chr5", lengthInBases: 10900205},
            {name: "chr6", lengthInBases: 9000009},
            {name: "chr7", lengthInBases: 7000400},
            {name: "chrM", lengthInBases: 100400},
        ]);
        this.model.setRegion(15000000, 25000000); // This setting should depend on this.props.trackRegionModel

        // TODO TrackRegionModel should be passed from parent (this.props.trackRegionModel); we will make one here for
        // test purposes.
        this.selectedRegionModel = new DisplayedRegionModel("meow", this.model.getChromosomeList());
        this.selectedRegionModel.setRegion(15500000, 16000000);
    }

    componentWillMount() {
        this.id = _.uniqueId();
    }

    componentDidMount() {
        this.svg = SVG(this.id);
        this.mainComponent = new GenomeNavigator(this.svg, this.model, {selectedRegionModel: this.selectedRegionModel});
    }

    render() {
        return (
            <div id={this.id} style={{border: "1px solid black"}}></div>
        );
    }
}

export default GenomeNavigatorReact;
