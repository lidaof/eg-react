import _ from 'lodash';

import RulerTrack from '../components/track/RulerTrack';
import BigWigTrack from '../components/track/BigWigTrack';
import GeneAnnotationTrack from '../components/track/geneAnnotationTrack/GeneAnnotationTrack';
import UnknownTrack from '../components/track/UnknownTrack';

/*
const SCHEMA = { // Schema for the plain object argument to the constructor.
    type: "object",
    properties: {
        name: {type: "string"}, // Label
        type | filetype: {type: "string"}, // Type of data
        options: {type: "object"},
        url: {type: "string"},
        // A better name for `metadata` would be `tags` or `misc`.
        // I don't like it, but it's what our JSON files contain.  
        metadata: {type: "object"} 
    }
}
*/

/**
 * Mapping from track type name to an object implementing the TrackSubtype interface.
 */
const TYPE_NAME_TO_SUBTYPE = {
    "ruler": RulerTrack,
    "bigwig": BigWigTrack,
    "hammock": GeneAnnotationTrack,
};

const DEFAULT_TRACK_NAME = "(unnamed track)";
let nextId = 0;

/**
 * An object storing track metadata and state.
 * 
 * @author Silas Hsu
 */
class TrackModel {
    /**
     * Makes a new TrackModel based off the input plain object.  Bascially does a shallow copy of the object and sets
     * sets reasonable defaults for certain properties.
     * 
     * @param {Object} plainObject - data that will form the basis of the new instance
     */
    constructor(plainObject) {
        Object.assign(this, plainObject);
        this.name = this.name || DEFAULT_TRACK_NAME;
        this.type = this.type || this.filetype || "";
        this.options = this.options || {};
        this.url = this.url || "";
        this.metadata = this.metadata || {};

        // Other misc props
        this.isSelected = false;
        this.id = nextId;
        nextId++;
    }

    /**
     * Gets the rendering configuration appropriate for the type contained in `this.type`.  If none can be found,
     * defaults to UnknownTrack.
     * 
     * @return {TrackSubtype} object containing rendering config appropriate for this model
     */
    getRenderConfig() {
        return TYPE_NAME_TO_SUBTYPE[this.type.toLowerCase()] || UnknownTrack;
    }

    /**
     * Gets this object's id.  Ids are used to keep track of track identity even through different instances of
     * TrackModel; two models with the same id are considered the same track, perhaps with different options configured.
     * 
     * @return {number} this object's id
     */
    getId() {
        return this.id;
    }

    /**
     * Deeply clones this, including id.
     * 
     * @return {TrackModel} a deep copy of this
     */
    clone() {
        return _.cloneDeep(this);
    }
}

export default TrackModel;
