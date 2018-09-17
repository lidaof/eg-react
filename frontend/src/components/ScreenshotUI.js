import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import withAutoDimensions from './withAutoDimensions';
import { withTrackData } from './trackContainers/TrackDataManager';
import { withTrackView } from './trackContainers/TrackViewManager';
import { TrackHandle } from './trackContainers/TrackHandle';
import { withTrackLegendWidth } from './withTrackLegendWidth';

function mapStateToProps(state) {
    return {
        genome: state.browser.present.genomeName,
        viewRegion: state.browser.present.viewRegion,
        tracks: state.browser.present.tracks,
        metadataTerms: state.browser.present.metadataTerms
    };
}

const withAppState = connect(mapStateToProps);
const withEnhancements = _.flowRight(withAppState, withAutoDimensions, withTrackView, withTrackData, withTrackLegendWidth);

class ScreenshotUINotConnected extends React.Component {
    static displayName = "ScreenshotUI";

    makeSvgTrackElements() {
        const {tracks, trackData, primaryView, metadataTerms} = this.props;
        const trackSvgElements = tracks.map((trackModel, index) => {
            const id = trackModel.getId();
            const data = trackData[id];
            return <TrackHandle
                key={trackModel.getId()}
                trackModel={trackModel}
                {...data}
                viewRegion={data.visRegion}
                width={primaryView.visWidth}
                viewWindow={primaryView.viewWindow}
                metadataTerms={metadataTerms}
                xOffset={0}
                index={index}
            />
        });
        
        return trackSvgElements;
    }

    render() {
        return this.makeSvgTrackElements();
    }
}

export const ScreenshotUI = withEnhancements(ScreenshotUINotConnected);