/**
 * The global Redux store for the Browser.  All state that needs to be saved and restored in sessions belongs here.
 * 
 * @author Silas Hsu
 */
import { createStore } from 'redux';
import allGenomes from './model/genomes/allGenomes';
import DisplayedRegionModel from './model/DisplayedRegionModel';

const initialState = {
    genomeIndex: -1,
    selectedRegion: null,
    tracks: [],
    regionSets: [], // Available region sets, to be used for region set view
    regionSetView: null, // Region set backing current region set view, if applicable
};

const ActionTypes = {
    SET_GENOME: 0,
    SET_VIEW_REGION: 1,
    SET_TRACKS: 2,
    SET_REGION_SET_LIST: 3,
    SET_REGION_SET_VIEW: 4,
};

/**
 * All action creators.  Components don't need to know this, though.  They can think of them as callbacks that modify
 * the global store (or state).
 */
export const ActionCreators = {
    /**
     * Modifies the current genome.
     * 
     * @param {number} index - index of the requested genome
     */
    setGenome: index => {
        return {type: ActionTypes.SET_GENOME, index: index};
    },

    /**
     * Replaces the list of available region sets with a new one.
     * 
     * @param {RegionSet[]} list - new region set list
     */
    setRegionSetList: list => {
        return {type: ActionTypes.SET_REGION_SET_LIST, list: list};
    },

    /**
     * Enters or exit region set view with a particular region set.  If null/undefined, exits region set view.
     * 
     * @param {RegionSet} [set] - set with which to enter region set view, or null to exit region set view
     */
    setRegionSetView: set => {
        return {type: ActionTypes.SET_REGION_SET_VIEW, set: set};
    }
};

/**
 * Handles a change in region set view.  Causes a change in the displayed region as well as region set.
 * 
 * @param {Object} prevState - previous redux store
 * @param {RegionSet} [nextSet] - region set to back region set view in the next state
 * @return {Object} next redux store
 */
function handleRegionSetViewChange(prevState, nextSet) {
    if (nextSet) {
        return {
            ...prevState,
            regionSetView: nextSet,
            selectedRegion: new DisplayedRegionModel(nextSet.makeNavContext())
        };
    } else {
        const genomeConfig = allGenomes[prevState.genomeIndex];
        const nextSelectedRegion = new DisplayedRegionModel(genomeConfig.navContext, ...genomeConfig.defaultRegion);
        return {
            ...prevState,
            regionSetView: null,
            selectedRegion: nextSelectedRegion
        };
    }
}

function getNextState(prevState = initialState, action) {
    switch (action.type) {
        case ActionTypes.SET_GENOME:
            return {...prevState, genomeIndex: action.index};
        case ActionTypes.SET_REGION_SET_LIST: 
            return {...prevState, regionSets: action.list};
        case ActionTypes.SET_REGION_SET_VIEW:
            return handleRegionSetViewChange(prevState, action.set);
        case "@@redux/INIT":
            return prevState;
        default:
            console.warn("Unknown change state action; ignoring.");
            console.warn(action);
            return prevState;
    }
}

// OK, so it's really an AppStore, but then that would mean something completely different 😛
export const AppState = createStore(getNextState);

export default AppState;
