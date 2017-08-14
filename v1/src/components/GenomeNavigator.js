import React from 'react';
import SVG from 'svg.js';
import _ from 'lodash';
import DisplayedRegionModel from '../model/DisplayedRegionModel';
import MainPane from './genomeNavSvg/MainPane';

const MIN_REGION_LENGTH = 80; // Minimum region length, where zooming is not allowed anymore

class GenomeNavigator extends React.Component {

    constructor(props) {
        super(props);
        // TODO the info required to make this model should be passed from the parent
        this.model = new DisplayedRegionModel("meow", [
            {name: "chr1", lengthInBases: 224999719},
            {name: "chr2", lengthInBases: 237712649},
            {name: "chr3", lengthInBases: 194704827},
            {name: "chr4", lengthInBases: 187297063},
            {name: "chr5", lengthInBases: 177702766},
            {name: "chr6", lengthInBases: 167273993},
            {name: "chr7", lengthInBases: 154952424},
            {name: "chrY", lengthInBases: 25121652},
        ]);
        this.model.setRegion(15000000, 25000000); // This setting should depend on this.props.trackRegionModel

        // TODO TrackRegionModel should be passed from parent (this.props.trackRegionModel); we will make one here for
        // test purposes.
        this.selectedRegionModel = new DisplayedRegionModel("meow", this.model.getChromosomeList());
        this.selectedRegionModel.setRegion(15500000, 16000000);

        this.zoomSlider = null;
        this.mainPane = null;
    }

    zoom(amount, focusPoint) {
        if (amount < 1 && this.model.getWidth() <= MIN_REGION_LENGTH) {
            return;
        }
        this.model.zoom(amount, focusPoint);
        this.zoomSlider.value = Math.log(this.model.getWidth());
        this.mainPane.redraw();
    }

    gotoSelectedRegion() {
        let selectedAbsRegion = this.selectedRegionModel.getAbsoluteRegion();
        let halfWidth = 0;
        if (this.selectedRegionModel.getWidth() < this.model.getWidth()) {
            halfWidth = this.model.getWidth() * 0.5;
        } else {
            halfWidth = this.selectedRegionModel.getWidth() * 3;
        }
        let regionCenter = (selectedAbsRegion.end + selectedAbsRegion.start) * 0.5;
        this.model.setRegion(regionCenter - halfWidth, regionCenter + halfWidth, true);
        this.zoomSlider.value = Math.log(this.model.getWidth());
        this.mainPane.redraw();
    }

    zoomSliderDragged(event) {
        let targetRegionSize = Math.exp(event.target.value);
        let proportion = targetRegionSize / this.model.getWidth();
        this.model.zoom(proportion);
        this.mainPane.redraw();
    }

    componentWillMount() {
        this.id = _.uniqueId();
    }

    componentDidMount() {
        this.svg = SVG(this.id);
        this.mainPane = new MainPane(this.svg, this.model, {
            selectedRegionModel: this.selectedRegionModel,
            zoomCallback: this.zoom.bind(this),
            gotoSelectedRegionCallback: this.gotoSelectedRegion.bind(this),
        });
    }

    render() {
        return (
            <div style={{padding: "20px"}}>
                <label>
                    Zoom:
                    <input
                        type="range"
                        min={Math.log(MIN_REGION_LENGTH)}
                        max={Math.log(this.model.getGenomeLength())}
                        step="any"
                        onChange={this.zoomSliderDragged.bind(this)}
                        ref={(input) => this.zoomSlider = input} />
                </label>

                <div id={this.id} style={{border: "1px solid black"}}></div>
            </div>
        );
    }
}

export default GenomeNavigator;
