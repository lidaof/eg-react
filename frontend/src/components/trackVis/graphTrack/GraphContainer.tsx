import React from "react";
import PropTypes from "prop-types";
import TrackModel from "model/TrackModel";
import DisplayedRegionModel from "model/DisplayedRegionModel";

class GraphContainer extends React.PureComponent {
    static propTypes = {
        tracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)).isRequired, // g3d Tracks to render
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
    };

    constructor(props: any) {
        super(props);
    }



    render() {
        return <div>aaa</div>;
    }
}

export default GraphContainer;
