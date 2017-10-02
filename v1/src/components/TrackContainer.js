import BigWigTrack from './BigWigTrack.js';
import BigWigDataSource from '../dataSources/BigWigDataSource';
import GeneAnnotationTrack from './geneAnnotationTrack/GeneAnnotationTrack';
import GeneDataSource from '../dataSources/GeneDataSource';
import PropTypes from 'prop-types';
import React from 'react';

const GENE_SOURCE = new GeneDataSource();

class TrackContainer extends React.Component {
    constructor(props) {
        super(props);
        this.makeTrackFromMetadataObj = this.makeTrackFromMetadataObj.bind(this);
    }

    makeTrackFromMetadataObj(obj, key) {
        let genericTrackProps = {
            viewRegion: this.props.viewRegion,
            newRegionCallback: this.props.newRegionCallback,
            key: key
        };
        let lowercaseType = obj.type.toLowerCase();
        switch (lowercaseType) {
            case BigWigTrack.TYPE_NAME.toLowerCase():
                return <BigWigTrack
                    {...genericTrackProps}
                    dataSource={new BigWigDataSource(obj.url)}
                />;
            case GeneAnnotationTrack.TYPE_NAME.toLowerCase():
                return <GeneAnnotationTrack
                    {...genericTrackProps}
                    dataSource={GENE_SOURCE}
                />;
            default:
                console.warn("Unknown track type " + obj.type);
                return null;
        }
    }

    render() {
        return (
            <div>
                {this.props.tracks.map(this.makeTrackFromMetadataObj) /* TODO make keys NOT index-based */}
            </div>
        );
    }
}

TrackContainer.propTypes = {
    newRegionCallback: PropTypes.func.isRequired,
    tracks: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default TrackContainer;
