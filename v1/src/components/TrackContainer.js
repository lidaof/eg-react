import BigWigTrack from './BigWigTrack.js';
import BigWigDataSource from '../dataSources/BigWigDataSource';
import GeneAnnotationTrack from './geneAnnotationTrack/GeneAnnotationTrack';
import GeneDataSource from '../dataSources/GeneDataSource';
import PropTypes from 'prop-types';
import React from 'react';

const bwSource = new BigWigDataSource();
const geneSource = new GeneDataSource();

class TrackContainer extends React.Component {
    render() {
        return (
            <div>
                {/* <BigWigTrack viewRegion={this.props.viewRegion} dataSource={bwSource} /> */}
                <GeneAnnotationTrack
                    viewRegion={this.props.viewRegion}
                    dataSource={geneSource}
                    newRegionCallback={this.props.newRegionCallback}
                />
            </div>
        );
    }
}

TrackContainer.propTypes = {
    newRegionCallback: PropTypes.func.isRequired,
}

export default TrackContainer;
