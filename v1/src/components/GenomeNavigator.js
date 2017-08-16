import React from 'react';
import SVG from 'svg.js';
import _ from 'lodash';
import DisplayedRegionModel from '../model/DisplayedRegionModel';
import MainPane from './genomeNavSvg/MainPane';
import TrackRegionController from './TrackRegionController';

const MIN_REGION_LENGTH = 80; // Minimum region length, where zooming is not allowed anymore

class GenomeNavigator extends React.Component {

    constructor(props) {
        super(props);
        this.id = _.uniqueId();
        let chromosomes = [
            {name: "chr1", lengthInBases: 224999719},
            {name: "chr2", lengthInBases: 237712649},
            {name: "chr3", lengthInBases: 194704827},
            {name: "chr4", lengthInBases: 187297063},
            {name: "chr5", lengthInBases: 177702766},
            {name: "chr6", lengthInBases: 167273993},
            {name: "chr7", lengthInBases: 154952424},
            {name: "chrY", lengthInBases: 25121652},
        ];
        this.state = {
            model: new DisplayedRegionModel("meow", chromosomes),
            selectedRegionModel: new DisplayedRegionModel("meow", chromosomes),
            svg: null,
        }
        // TODO the info required to make this model should be passed from the parent
        this.state.model.setRegion(15000000, 25000000); // This setting should depend on this.props.trackRegionModel
        this.state.selectedRegionModel.setRegion(15599999, 16000000);

        // TODO TrackRegionModel should be passed from parent (this.props.trackRegionModel); we will make one here for
        // test purposes.
        this.regionSelected = this.regionSelected.bind(this);
        this.zoom = this.zoom.bind(this);
        this.setNewView = this.setNewView.bind(this);
        this.zoomSliderDragged = this.zoomSliderDragged.bind(this);
    }

    cloneAndMutate(modelObj, methodName, args) {
        let copy = _.cloneDeep(modelObj);
        copy[methodName].apply(copy, args);
        return copy;
    }

    regionSelected(newStart, newEnd) {
        let modelCopy = _.cloneDeep(this.state.selectedRegionModel);
        modelCopy.setRegion(newStart, newEnd, true);
        this.setState({selectedRegionModel: modelCopy});
    }

    zoom(amount, focusPoint) {
        if (amount < 1 && this.state.model.getWidth() <= MIN_REGION_LENGTH) {
            return;
        }
        let modelCopy = _.cloneDeep(this.state.model);
        modelCopy.zoom(amount, focusPoint);
        this.setState({model: modelCopy});
    }

    setNewView(newStart, newEnd) {
        let modelCopy = _.cloneDeep(this.state.model);
        modelCopy.setRegion(newStart, newEnd, true);
        this.setState({model: modelCopy});
    }

    zoomSliderDragged(event) {
        let targetRegionSize = Math.exp(event.target.value);
        let proportion = targetRegionSize / this.state.model.getWidth();

        let modelCopy = _.cloneDeep(this.state.model);
        modelCopy.zoom(proportion);
        this.setState({model: modelCopy});
    }

    componentDidMount() {
        this.setState({svg: SVG(this.id)})
    }

    render() {
        return (
            <div style={{padding: "20px"}}>
                <label>
                    Zoom:
                    <input
                        type="range"
                        min={Math.log(MIN_REGION_LENGTH)}
                        max={Math.log(this.state.model.getGenomeLength())}
                        step="any"
                        value={Math.log(this.state.model.getWidth())}
                        onChange={this.zoomSliderDragged.bind(this)}
                    />
                </label>
                <TrackRegionController model={this.state.selectedRegionModel} newRegionCallback={this.regionSelected}/>

                {/* This div will hold the actual svg element; SVG.js adds it in componentDidMount() */}
                <div id={this.id} style={{border: "1px solid black"}}></div>
                {
                    this.state.svg &&
                    <MainPane
                        svg={this.state.svg}
                        model={this.state.model}
                        selectedRegionModel={this.state.selectedRegionModel} // TODO Or rather, this.props.
                        regionSelectedCallback={this.regionSelected}
                        dragCallback={this.setNewView}
                        gotoButtonCallback={this.setNewView}
                        zoomCallback={this.zoom}
                    />
                }
            </div>
        );
    }
}

export default GenomeNavigator;
