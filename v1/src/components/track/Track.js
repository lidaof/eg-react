import React from 'react';
import PropTypes from 'prop-types';

import Reparentable from '../Reparentable';

import BigWigTrack from './BigWigTrack';
import GeneAnnotationTrack from './geneAnnotationTrack/GeneAnnotationTrack';
import RulerTrack from './RulerTrack';

import BigWigSource from '../../dataSources/BigWigSource';
import BedSource from '../../dataSources/BedSource';
import withDataFetching from '../DataFetcher';

import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import TrackModel from '../../model/TrackModel';
import { GeneFormatter } from '../../model/Gene';

/**
 * Prop types common to all tracks
 */
export const TRACK_PROP_TYPES = {
    trackModel: PropTypes.instanceOf(TrackModel).isRequired, // Metadata for this track
    viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // The region of the genome to display
    width: PropTypes.number.isRequired, // Width of the track's visualization (does not include legend)
    
    viewExpansionValue: PropTypes.number, // How much to enlarge view on both sides
    onNewData: PropTypes.func, // Callback for when track finishes fetching data
    xOffset: PropTypes.number, // The horizontal amount to translate visualizations
};

const TYPE_TO_TRACK = {
    "bigwig": withDataFetching(BigWigTrack, (props) => new BigWigSource(props.trackModel.url)),
    "hammock": withDataFetching(
        GeneAnnotationTrack, (props) => new BedSource(props.trackModel.url, new GeneFormatter())
    ),
    "ruler": RulerTrack
};

/**
 * A general Track object.  Renders specific types of tracks depending on the contents of the given TrackModel.
 * 
 * @author Silas Hsu
 */
export class Track extends React.Component {
    static propTypes = TRACK_PROP_TYPES;

    static defaultProps = {
        onNewData: () => undefined,
        viewExpansionValue: 0,
        xOffset: 0,
    };

    render() {
        const type = this.props.trackModel.getType().toLowerCase();
        let TrackSubType = TYPE_TO_TRACK[type];
        if (!TrackSubType) {
            console.warn(`Unknown track type "${type}"`);
            return null;
        } else {
            return (
            <Reparentable uid={"track-" + this.props.trackModel.getId()} >
                <TrackSubType {...this.props} />
            </Reparentable>
            );
        }
    }
}
