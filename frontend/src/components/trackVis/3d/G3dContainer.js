import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { withTrackData } from "../../trackContainers/TrackDataManager";
import { withTrackView } from "../../trackContainers/TrackViewManager";
import TrackHandle from "../../trackContainers/TrackHandle";
import TrackModel from "model/TrackModel";
import DisplayedRegionModel from "model/DisplayedRegionModel";
import withAutoDimensions from "components/withAutoDimensions";

const withEnhancements = _.flowRight(withAutoDimensions, withTrackView, withTrackData);

class G3dContainer extends React.PureComponent {
    static propTypes = {
        tracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)).isRequired, // g3d Tracks to render
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
        trackData: PropTypes.object.isRequired,
    };

    render() {
        const { tracks, trackData, primaryView, viewRegion } = this.props;
        const trackModel = tracks[0];
        const id = trackModel.getId();
        const data = trackData[id];
        return (
            <TrackHandle
                key={id}
                trackModel={trackModel}
                {...data}
                viewRegion={data.visRegion}
                width={primaryView.visWidth}
                viewWindow={primaryView.viewWindow}
                selectedRegion={viewRegion}
            />
        );
    }
}

export default withEnhancements(G3dContainer);
