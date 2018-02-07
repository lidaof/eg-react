/*
const SCHEMA = { // Schema for the plain object argument to the constructor.
    type: "object",
    properties: {
        name: {type: "string"},
        type | filetype: {type: "string"},
        options: {type: "object"},
        url: {type: "string"},
        // A better name for `metadata` would be `tags` or `misc`.
        // I don't like it, but it's what our JSON files contain.  
        metadata: {type: "object"} 
    }
}
*/

const DEFAULT_TRACK_NAME = "(unnamed track)"

class TrackModel {
    static nextId = 0;

    constructor(plainObject) {
        Object.assign(this, plainObject);
        this.name = this.name || DEFAULT_TRACK_NAME;
        this.type = this.type || this.filetype || "";
        this.options = this.options || {};
        this.url = this.url || "";
        this.metadata = this.metadata || {};

        this.id = TrackModel.nextId;
        TrackModel.nextId++;
    }

    getType() {
        return this.type.toLowerCase();
    }

    getId() {
        return this.id;
    }
}

export default TrackModel;
