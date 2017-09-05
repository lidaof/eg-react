import BigWigTrack from './BigWigTrack.js';
import React from 'react';

class TrackContainer extends React.Component {
    render() {
        return (
            <div>
                <BigWigTrack viewRegion={this.props.viewRegion} />
                <BigWigTrack viewRegion={this.props.viewRegion} />
            </div>
        );
    }
}

export default TrackContainer;
