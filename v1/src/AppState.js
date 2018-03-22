import { createStore } from 'redux';

const initialState = {
    genomeIndex: -1,
    selectedRegion: null,
    tracks: [],
    regionSets: [],
    regionSetIndex: -1, // If the index doesn't exist, default to genome view
};

const ActionTypes = {
    SET_GENOME: 0,
    SET_VIEW_REGION: 1,
    SET_TRACKS: 2,
    ADD_REGION_SET: 3,
    CHANGE_REGION_SET: 4,
};

/**
 * All action creators.  Components don't need to know this, though.  They can think of them as callbacks that modify
 * the global store (or state).
 */
export const ActionCreators = {
    /**
     * Creates a request to modify the index of the current genome.
     * 
     * @param {number} index - the requested index
     */
    setGenome: index => {
        return {type: ActionTypes.SET_GENOME, index: index};
    },
};

function getNextState(prevState = initialState, action) {
    switch (action.type) {
        case ActionTypes.SET_GENOME:
            return {...prevState, genomeIndex: action.index};
        default:
            return prevState;
    }
}

// OK, so it's really an AppStore, but then that would mean something completely different 😛
export const AppState = createStore(getNextState);

export default AppState;
