import _ from 'lodash';

export interface TrackOptions {
    label?: string;
    [k: string]: any;
}

interface ITrackModelMetadata {
    'Track Type'?: string;
    genome?: string;
    [k: string]: any;
}

interface ITrackModel {
    name: string;
    type?: string;
    filetype?: string;
    options: TrackOptions;
    url: string;
    metadata: ITrackModelMetadata;
}

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
export class TrackModel {
    /**
     * Makes a new TrackModel based off the input plain object.  Bascially does a shallow copy of the object and sets
     * sets reasonable defaults for certain properties.
     * 
     * @param {ITrackModel} plainObject - data that will form the basis of the new instance
     */
    name: string;
    type: string;
    label: string;
    filetype?: string;
    options: TrackOptions;
    url: string;
    metadata: ITrackModelMetadata;
    id: number;
    isSelected: boolean;

    constructor(plainObject: ITrackModel) {
        Object.assign(this, plainObject);
        this.name = this.label || this.name || "";
        this.isSelected = this.isSelected || false;
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
    getId(): number {
        return this.id;
    }

    /**
     * Gets the label to display for this track; this method returns a reasonable default even in the absence of data.
     * 
     * @return {string} the display label of the track
     */
    getDisplayLabel(): string {
        return this.options.label || "(unnamed track)";
    }

    /**
     * TODO: Document this.
     *
     * @param {string} term
     * @returns {string}
     * @memberof TrackModel
     */
    getMetadata(term: string): string {
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
    clone(): TrackModel {
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
    cloneAndSetOption(name: string, optionValue: any): TrackModel {
        const clone = this._cloneThisAndProp("options");
        clone.options[name] = optionValue;
        return clone;
    }

    /**
     * Shallowly clones this and also selects a particular property to be cloned one level deeper.
     * 
     * @param {string} prop - property name to also clone
     * @return {TrackModel} shallow clone of this
     */
    _cloneThisAndProp(prop: string): TrackModel {
        const clone = _.clone(this);
        clone[prop] = _.clone(this[prop]);
        return clone;
    }
}

export default TrackModel;
