/**
 * Utility functions common to all Tracks, and to make new Tracks.
 * 
 * @author Silas Hsu
 */
import React from 'react';
import PropTypes from 'prop-types';

import BigWigTrack from './BigWigTrack';
import GeneAnnotationTrack from './geneAnnotationTrack/GeneAnnotationTrack';
import withDataFetching from './DataFetcher';

import BigWigSource from '../dataSources/BigWigSource';
import BedSource from '../dataSources/BedSource';

import DisplayedRegionModel from '../model/DisplayedRegionModel';
import TrackModel from '../model/TrackModel';
import { GeneFormatter } from '../model/Gene';

/**
 * Prop types common to all tracks
 */
export const TRACK_PROP_TYPES = {
    trackModel: PropTypes.instanceOf(TrackModel).isRequired, // Metadata for this track
    viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // The region of the genome to display

    viewExpansionValue: PropTypes.number, // How much to enlarge view on both sides
    width: PropTypes.number, // The width of the track
    xOffset: PropTypes.number, // The horizontal amount to translate visualizations
}

/**
 * Used in makeTrack
 */
const TYPE_TO_TRACK = {
    "bigwig": withDataFetching(BigWigTrack, (props) => new BigWigSource(props.trackModel.url)),
    "hammock": withDataFetching(
        GeneAnnotationTrack, (props) => new BedSource(props.trackModel.url, new GeneFormatter())
    )
}

export class Track extends React.Component {
    static propTypes = TRACK_PROP_TYPES;

    componentWillUnmount() {
        console.log("unmount!");
    }

    render() {
        const type = this.props.trackModel.getType().toLowerCase();
        let TrackSubType = TYPE_TO_TRACK[type];
        if (!TrackSubType) {
            console.warn(`Unknown track type "${type}"`);
            return null;
        } else {
            return <TrackSubType {...this.props} />;
        }
    }
}
