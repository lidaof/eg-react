import RulerTrack from './RulerTrack';
import BigWigTrack from './BigWigTrack';
import BedTrack from './bedTrack/BedTrack';
import BedGraphTrack from './BedGraphTrack';
import GeneAnnotationTrack from './geneAnnotationTrack/GeneAnnotationTrack';
import RepeatMaskerTrack from './RepeatMaskerTrack';
import UnknownTrack from './UnknownTrack';

/**
 * Mapping from track type name to an object implementing the TrackSubtype interface.  Uppercase letters are disallowed
 * in type names, because we want comparisons to be case-insensitive.
 */
const TYPE_NAME_TO_SUBTYPE = {
    "ruler": RulerTrack,
    "bigwig": BigWigTrack,
    "bed": BedTrack,
    "bedgraph": BedGraphTrack,
    "geneannotation": GeneAnnotationTrack,
    "repeatmasker": RepeatMaskerTrack,
};

if (process.env.NODE_ENV !== "production") { // Check if all the subtypes are clean
    for (let subtypeName in TYPE_NAME_TO_SUBTYPE) {
        if (subtypeName.toLowerCase() !== subtypeName) {
            throw new TypeError(`Uppercase letters are disallowed in type names.  Offender: "${subtypeName}"`);
        }
        const subtype = TYPE_NAME_TO_SUBTYPE[subtypeName];
        if (!subtype.visualizer) {
            throw new TypeError(`In config for type "${subtypeName}": a visualizer is required, but it was undefined.`);
        } else if (!subtype.legend) {
            throw new TypeError(`In config for type "${subtypeName}": a legend is required, but it was undefined.`);
        }
    }
}

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
 * Aggregates a single option of multiple track models.  If all tracks have the same value for an option, returns that
 * value; otherwise, returns the `multiValue` parameter.
 * 
 * @param {TrackModel[]} tracks - track models to aggregate
 * @param {string} optionName - the option property to examine in each track
 * @param {any} defaultValue - default option value if a track doesn't already have a default for its subtype
 * @param {any} multiValue - value to return if there are multiple different option values
 * @return {any} aggregated option value of the tracks
 */
export function aggregateOptions(tracks, optionName, defaultValue, multiValue) {
    if (tracks.length === 0) {
        return defaultValue;
    }

    // Returns the option value for a track, or undefined.
    const getOption = function(track) { 
        const subtypeDefaults = getSubtypeConfig(track).defaultOptions || {};
        return track.options[optionName] || subtypeDefaults[optionName];
    }

    const firstOptionValue = getOption(tracks[0]);
    if (tracks.every(track => getOption(track) === firstOptionValue)) {
        return firstOptionValue || defaultValue;
    } else {
        return multiValue;
    }
}
