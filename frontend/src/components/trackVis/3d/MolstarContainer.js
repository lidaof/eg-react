import React from "react";
import PropTypes from "prop-types";
import TrackModel from "model/TrackModel";
import DisplayedRegionModel from "model/DisplayedRegionModel";
import Molstar3D from "./Molstar3D";
import { arraysEqual } from "../../../util";

class MolstarContainer extends React.PureComponent {
    static propTypes = {
        tracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)).isRequired, // g3d Tracks to render
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
    };

    constructor(props) {
        super(props);
        this.myRef = React.createRef();
        this.mol = null;
    }

    componentDidMount() {
        this.visualG3d();
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.mol) {
            if(prevProps.viewRegion !== this.props.viewRegion) {
                const chroms = this.viewRegionToChroms()
                const regions = this.viewRegionToRegions();
                const prevChroms = prevProps.viewRegion.getFeatureSegments().map(region => region.getName());
                if(!arraysEqual(prevChroms, chroms)){
                    this.mol.showChroms3dStruct(chroms);
                }
                this.mol.showRegions3dStruct(regions);
            }
        }
    }

    viewRegionToChroms = () => {
        const regions = this.props.viewRegion.getFeatureSegments();
        return regions.map(region => region.getName());
    }

    viewRegionToRegions = () => {
        const regions = this.props.viewRegion.getFeatureSegments();
        return regions.map(region => ({chrom: region.getName(), start: region.relativeStart, end: region.relativeEnd}))
    }

    visualG3d = async () => {
        const { tracks } = this.props;
        const trackModel = tracks[0];
        this.mol = new Molstar3D(this.myRef.current);
        await this.mol.init({ url: trackModel.url });
        const chroms = this.viewRegionToChroms()
        const regions = this.viewRegionToRegions();
        this.mol.showChroms3dStruct(chroms);
        this.mol.showRegions3dStruct(regions);
        // mol.decorChrom3d();
        // this.mol.decorRegion3d();
    };

    render() {
        return <div ref={this.myRef}></div>;
    }
}

export default MolstarContainer;
