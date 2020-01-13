/**
 * Aggregates a single option of multiple track options.  If all tracks have the same value for an option, returns that
 * value; otherwise, returns the `multiValue` parameter.
 *
 * @param {Object[]} optionsObjects - options of all the track models to aggregate
 * @param {string} optionName - the option property to examine in each track
 * @param {any} defaultValue - default option value if a track doesn't already have a default for its subtype
 * @param {any} multiValue - value to return if there are multiple different option values
 * @return {any} aggregated option value of the tracks
 */
function aggregateOptions(optionsObjects, optionName, defaultValue, multiValue) {
    if (optionsObjects.length === 0) {
        return defaultValue;
    }

    const firstOptionValue = optionsObjects[0][optionName];
    if (optionsObjects.every(options => options[optionName] === firstOptionValue)) {
        if (firstOptionValue === undefined) {
            return defaultValue;
        }
        return firstOptionValue;
    } else {
        return multiValue;
    }
}

export default aggregateOptions;
