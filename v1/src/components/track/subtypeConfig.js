import RulerTrack from './RulerTrack';
import BigWigTrack from './BigWigTrack';
import GeneAnnotationTrack from './geneAnnotationTrack/GeneAnnotationTrack';
import UnknownTrack from './UnknownTrack';

/**
 * Mapping from track type name to an object implementing the TrackSubtype interface.
 */
const TYPE_NAME_TO_SUBTYPE = {
    "ruler": RulerTrack,
    "bigwig": BigWigTrack,
    "hammock": GeneAnnotationTrack,
};

/**
 * Gets the rendering configuration appropriate for the type contained in the track model's type.  If none can be found,
 * defaults to UnknownTrack.
 * 
 * @param {TrackModel} trackModel - the track model to examine for type information
 * @return {TrackSubtype} object containing rendering config appropriate for this model
 */
export function getSubtypeConfig(trackModel) {
    return TYPE_NAME_TO_SUBTYPE[trackModel.type.toLowerCase()] || UnknownTrack;
}

/**
 * Gets the options object for a TrackModel, but with defaults for that subtype merged in.
 * 
 * @param {TrackModel} trackModel - track model for which to get options
 * @return {Object} options object
 */
export function getOptions(trackModel) {
    const subtype = getSubtypeConfig(trackModel);
    return Object.assign({}, subtype.defaultOptions || {}, trackModel.options);
}
