/**
 * The global Redux store for the Browser.  All state that needs to be saved and restored in sessions belongs here.
 * 
 * @author Silas Hsu
 */
import { createStore } from 'redux';
import { getGenomeConfig } from './model/genomes/allGenomes';
import DisplayedRegionModel from './model/DisplayedRegionModel';
import { AppStateSaver, AppStateLoader } from './model/AppSaveLoad';

// If you want to disable autosave, you can replace STORAGE with a mock:
// {setItem: () => null, getItem: () => null}
const STORAGE = window.sessionStorage; 
const SESSION_KEY = "eg-react-session";
const MIN_VIEW_REGION_SIZE = 100;

const initialState = {
    genomeName: "",
    viewRegion: null,
    tracks: [],
    metadataTerms: [],
    regionSets: [], // Available region sets, to be used for region set view
    regionSetView: null, // Region set backing current region set view, if applicable
};

const ActionTypes = {
    SET_GENOME: 0,
    SET_VIEW_REGION: 1,
    SET_TRACKS: 2,
    SET_METADATA_TERMS: 3,
    SET_REGION_SET_LIST: 4,
    SET_REGION_SET_VIEW: 5,
};

/**
 * All action creators.  Components don't need to know this, though.  They can think of them as callbacks that modify
 * the global store (or state).
 */
export const ActionCreators = {
    /**
     * Modifies the current genome.
     * 
     * @param {string} genomeName - name of the genome
     */
    setGenome: genomeName => {
        return {type: ActionTypes.SET_GENOME, genomeName: genomeName};
    },

    setViewRegion: (newStart, newEnd) => {
        return {type: ActionTypes.SET_VIEW_REGION, start: newStart, end: newEnd};
    },

    setTracks: newTracks => {
        return {type: ActionTypes.SET_TRACKS, tracks: newTracks};
    },

    setMetadataTerms: newTerms => {
        return {type: ActionTypes.SET_METADATA_TERMS, terms: newTerms}
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

function getInitialState() {
    let state = initialState;
    const blob = STORAGE.getItem(SESSION_KEY);
    if (blob) {
        try {
            state = new AppStateLoader().fromJSON(blob);
        } catch (error) {
            console.error("Error restoring session");
            console.error(error);
        }
    }

    return state;
}

function getNextState(prevState, action) {
    if (!prevState) {
        return getInitialState();
    }

    switch (action.type) {
        case ActionTypes.SET_GENOME: // Setting genome resets state.
            let nextViewRegion = null;
            let nextTracks = [];
            const genomeConfig = getGenomeConfig(action.genomeName);
            if (genomeConfig) {
                nextViewRegion = new DisplayedRegionModel(genomeConfig.navContext, ...genomeConfig.defaultRegion);
                nextTracks = genomeConfig.defaultTracks;
            }
            return {
                ...initialState,
                genomeName: action.genomeName,
                viewRegion: nextViewRegion,
                tracks: nextTracks
            };
        case ActionTypes.SET_VIEW_REGION:
            if (!prevState.viewRegion || action.end - action.start < MIN_VIEW_REGION_SIZE) {
                return prevState;
            } else {
                const newRegion = prevState.viewRegion.clone().setRegion(action.start, action.end);
                return { ...prevState, viewRegion: newRegion };
            }
        case ActionTypes.SET_TRACKS:
            return { ...prevState, tracks: action.tracks };
        case ActionTypes.SET_METADATA_TERMS:
            return { ...prevState, metadataTerms: action.terms };
        case ActionTypes.SET_REGION_SET_LIST:
            return { ...prevState, regionSets: action.list };
        case ActionTypes.SET_REGION_SET_VIEW:
            return handleRegionSetViewChange(prevState, action.set);
        default:
            console.warn("Unknown change state action; ignoring.");
            console.warn(action);
            return prevState;
    }
}


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
            viewRegion: new DisplayedRegionModel(nextSet.makeNavContext())
        };
    } else {
        const genomeConfig = getGenomeConfig(prevState.genomeName);
        const nextViewRegion = genomeConfig ? 
            new DisplayedRegionModel(genomeConfig.navContext, ...genomeConfig.defaultRegion) : null;
        return {
            ...prevState,
            regionSetView: null,
            viewRegion: nextViewRegion
        };
    }
}

// OK, so it's really an AppStore, but then that would mean something completely different 😛
export const AppState = createStore(
    getNextState,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

window.addEventListener("beforeunload", () => {
    const state = AppState.getState();
    if (state !== initialState) {
        const blob = new AppStateSaver().toJSON(state);
        STORAGE.setItem(SESSION_KEY, blob);
    }
});

export default AppState;
