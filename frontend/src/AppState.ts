/**
 * The global Redux store for the Browser.  All state that needs to be saved and restored in sessions belongs here.
 * 
 * @author Silas Hsu
 */
import { createStore, combineReducers } from 'redux';
import { getGenomeConfig } from './model/genomes/allGenomes';
import DisplayedRegionModel from './model/DisplayedRegionModel';
import { AppStateSaver, AppStateLoader } from './model/AppSaveLoad';
import TrackModel from './model/TrackModel';
import RegionSet from './model/RegionSet';
import undoable from 'redux-undo';
import uuid from "uuid";

import _ from 'lodash';

let STORAGE: any = window.sessionStorage;
if (process.env.NODE_ENV === "test") { // jsdom doesn't support local storage.  Use a mock.
    const storage = {};

    STORAGE = {
        setItem(key: string, value: any) {
            storage[key] = value || '';
        },
        getItem(key: string) {
            return key in storage ? storage[key] : null;
        },
        removeItem(key: string) {
            delete storage[key];
        },
        get length() {
            return Object.keys(storage).length;
        },
        key(i: number) {
            const keys = Object.keys(storage);
            return keys[i] || null;
        }
    };
}
const SESSION_KEY = "eg-react-session";
export const MIN_VIEW_REGION_SIZE = 5;
export const DEFAULT_TRACK_LEGEND_WIDTH = 120;

const sessionString = uuid.v1();

export interface SessionData {
    date: Date,
    data: AppState,
    label: string,
}

export interface AppState {
    genomeName: string;
    viewRegion: DisplayedRegionModel;
    tracks: TrackModel[];
    metadataTerms: string[];
    regionSets: RegionSet[];
    regionSetView: RegionSet;
    trackLegendWidth: number;
    sessionId: string;
    sessionStatus: SessionData[];
    statusDate: Date,
}

const initialState: AppState = {
    genomeName: "",
    viewRegion: null,
    tracks: [],
    metadataTerms: [],
    regionSets: [], // Available region sets, to be used for region set view
    regionSetView: null, // Region set backing current region set view, if applicable
    trackLegendWidth: DEFAULT_TRACK_LEGEND_WIDTH,
    sessionId: sessionString,
    sessionStatus: [],
    statusDate: new Date(),
};

enum ActionType {
    SET_GENOME = "SET_GENOME",
    SET_VIEW_REGION = "SET_VIEW_REGION",
    SET_TRACKS = "SET_TRACKS",
    SET_METADATA_TERMS = "SET_METADATA_TERMS",
    SET_REGION_SET_LIST = "SET_REGION_SET_LIST",
    SET_REGION_SET_VIEW = "SET_REGION_SET_VIEW",
    SET_TRACK_LEGEND_WIDTH = "SET_TRACK_LEGEND_WIDTH",
    SAVE_SESSION = "SAVE_SESSION",
    RESTORE_SESSION = "RESTORE_SESSION",
    // INIT = "@@INIT",
}

interface AppAction {
    type: ActionType;
    [actionArgs: string]: any;
}

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
    setGenome: (genomeName: string) => {
        return {type: ActionType.SET_GENOME, genomeName};
    },

    setViewRegion: (newStart: number, newEnd: number) => {
        return {type: ActionType.SET_VIEW_REGION, start: newStart, end: newEnd};
    },

    setTracks: (newTracks: TrackModel[]) => {
        return {type: ActionType.SET_TRACKS, tracks: newTracks};
    },

    setMetadataTerms: (newTerms: string[]) => {
        return {type: ActionType.SET_METADATA_TERMS, terms: newTerms};
    },

    /**
     * Replaces the list of available region sets with a new one.
     * 
     * @param {RegionSet[]} list - new region set list
     */
    setRegionSetList: (list: RegionSet[]) => {
        return {type: ActionType.SET_REGION_SET_LIST, list};
    },

    /**
     * Enters or exit region set view with a particular region set.  If null/undefined, exits region set view.
     * 
     * @param {RegionSet} [set] - set with which to enter region set view, or null to exit region set view
     */
    setRegionSetView: (set: RegionSet) => {
        return {type: ActionType.SET_REGION_SET_VIEW, set};
    },

    setTrackLegendWidth: (width: number) => {
        return {type: ActionType.SET_TRACK_LEGEND_WIDTH, width};
    },

    saveSession: (sessionData: [AppState, string]) => {
        return {type: ActionType.SAVE_SESSION, sessionData};
    },

    restoreRession: (sessionData: AppState) => {
        return {type: ActionType.RESTORE_SESSION, sessionData};
    },
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

function getNextState(prevState: AppState, action: AppAction): AppState {
    if (!prevState) {
        return getInitialState();
    }

    switch (action.type) {
        case ActionType.SET_GENOME: // Setting genome resets state.
        // case ActionType.INIT:
            let nextViewRegion = null;
            let nextTracks: TrackModel[] = [];
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
        case ActionType.SET_VIEW_REGION:
            if (!prevState.viewRegion) {
                return prevState;
            }

            let {start, end} = action;
            const newLength = end - start;
            if (newLength < MIN_VIEW_REGION_SIZE) {
                const amountToExpand = 0.5 * (MIN_VIEW_REGION_SIZE - newLength);
                start -= amountToExpand;
                end += amountToExpand;
            }

            const newRegion = prevState.viewRegion.clone().setRegion(start, end);
            return { ...prevState, viewRegion: newRegion };
        case ActionType.SET_TRACKS:
            return { ...prevState, tracks: action.tracks };
        case ActionType.SET_METADATA_TERMS:
            return { ...prevState, metadataTerms: action.terms };
        case ActionType.SET_REGION_SET_LIST:
            return { ...prevState, regionSets: action.list };
        case ActionType.SET_REGION_SET_VIEW:
            return handleRegionSetViewChange(prevState, action.set);
        case ActionType.SET_TRACK_LEGEND_WIDTH:
            return { ...prevState, trackLegendWidth: action.width };
        case ActionType.SAVE_SESSION:
            const statusDate = new Date();
            const session: SessionData = {
                label: action.sessionData[1],
                date: statusDate,
                data: {...action.sessionData[0], statusDate},
            };
            const newSession = [...prevState.sessionStatus, session];
            return { ...prevState, sessionStatus: newSession, statusDate };
        case ActionType.RESTORE_SESSION:
            const withoutSessionStatus = _.omit(action.sessionData, ['sessionId', 'sessionStatus']);
            // keeps status list on all status
            return { ...prevState, ...withoutSessionStatus };
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
function handleRegionSetViewChange(prevState: AppState, nextSet: RegionSet) {
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

const rootReducer = combineReducers({
    browser: undoable(getNextState, {limit: 10} )
});

// OK, so it's really an AppStore, but then that would mean something completely different 😛
export const AppState = createStore(
    rootReducer,
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()
);

window.addEventListener("beforeunload", () => {
    const state = AppState.getState();
    if (state !== initialState) {
        const blob = new AppStateSaver().toJSON(state.browser.present);
        STORAGE.setItem(SESSION_KEY, blob);
    }
});

export default AppState;
