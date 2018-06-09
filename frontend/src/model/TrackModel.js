import _ from 'lodash';

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
        this.name = this.label || this.name || "";
        this.type = this.type || this.filetype || "";
        this.type = this.type.toLowerCase();
        this.options = this.options || {}; // `options` stores dynamically-configurable options.
        this.options.label = this.name; // ...which is why we copy this.name.
        this.url = this.url || "";
        this.metadata = this.metadata || {};
        this.metadata["Track type"] = this.type;

        // Other misc props
        this.id = nextId;
        nextId++;
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
     * Gets the label to display for this track; this method returns a reasonable default even in the absence of data.
     * 
     * @return {string} the display label of the track
     */
    getDisplayLabel() {
        return this.options.label || "(unnamed track)";
    }

    getMetadata(term) {
        const value = this.metadata[term];
        if (Array.isArray(value)) {
            return value[value.length - 1];
        } else {
            return value;
        }
    }

    /**
     * **Shallowly** clones this.
     * 
     * @return {TrackModel} a shallow copy of this
     */
    clone() {
        return _.clone(this);
    }

    /**
     * Shallowly clones `this` and `this.options`, and then modifies the clone's options.  Returns the clone.  This
     * method will not mutate this instance.
     * 
     * @param {string} name - the name of the option to set
     * @param {any} optionValue - the value of the option
     * @return {TrackModel} shallow clone of this, with the option set
     */
    cloneAndSetOption(name, optionValue) {
        let clone = this._cloneThisAndProp("options");
        clone.options[name] = optionValue;
        return clone;
    }

    /**
     * Shallowly clones this and also selects a particular property to be cloned one level deeper.
     * 
     * @param {string} prop - property name to also clone
     * @return {TrackModel} shallow clone of this
     */
    _cloneThisAndProp(prop) {
        let clone = _.clone(this);
        clone[prop] = _.clone(this[prop]);
        return clone;
    }
}

export default TrackModel;
