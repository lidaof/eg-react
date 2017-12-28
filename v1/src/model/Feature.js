class Feature {
    /**
     * 
     * @param {ChromosomeInterval} location 
     */
    constructor(name, location) {
        this._name = name || location.toString();
        this._coordinates = location;
    }

    getName() {
        return this._name;
    }

    getLength() {
        return this._coordinates.getLength();
    }

    getCoordinates() {
        return this._coordinates;
    }
}

export default Feature;
