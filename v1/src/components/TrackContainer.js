import BigWigTrack from './BigWigTrack.js';
import BigWigDataSource from '../dataSources/BigWigDataSource';
import GeneAnnotationTrack from './geneAnnotationTrack/GeneAnnotationTrack';
import GeneDataSource from '../dataSources/GeneDataSource';
import PropTypes from 'prop-types';
import React from 'react';

const GENE_SOURCE = new GeneDataSource();

/**
 * Contains all tracks and makes tracks from TrackMetadata objects.
 * 
 * @author Silas Hsu
 */
class TrackContainer extends React.Component {
    static propTypes = {
        /**
         * Called whenever a track requests that the view be changed, such as when a track is dragged.  Signature:
         *     (newStart: number, newEnd: number): void
         *         `newStart`: the absolute base number of the start of the new view interval
         *         `newEnd`: the absolute base number of the end of the new view interval
         */
        newRegionCallback: PropTypes.func.isRequired,
        tracks: PropTypes.arrayOf(PropTypes.object).isRequired, // The tracks to display.  Array of TrackMetadata.
    }

    constructor(props) {
        super(props);
        this.makeTrackFromMetadataObj = this.makeTrackFromMetadataObj.bind(this);
    }

    makeTrackFromMetadataObj(obj, key) {
        let genericTrackProps = {
            viewRegion: this.props.viewRegion,
            newRegionCallback: this.props.newRegionCallback,
            key: key // TODO make keys NOT index-based
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
                {this.props.tracks.map(this.makeTrackFromMetadataObj)}
            </div>
        );
    }
}

export default TrackContainer;
