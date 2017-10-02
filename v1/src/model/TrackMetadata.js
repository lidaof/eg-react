/*
const SCHEMA = { // Schema for the plain object argument to the constructor.
    type: "object",
    properties: {
        name: {type: "string"},
        type: {type: "string"},
        options: {type: "object"},
        url: {type: "string"},
        // A better name for `metadata` would be `tags` or `misc`.
        // I don't like it, but it's what our JSON files contain.  
        metadata: {type: "object"} 
    }
}
*/

class TrackMetadata {
    constructor(plainObject) {
        Object.assign(this, plainObject);
        if (!this.name || !this.type) {
            throw new TypeError("Properties `name` and `type` are required");
        }
        if (!this.metadata) {
            this.metadata = {};
        }
    }
}

export default TrackMetadata;
