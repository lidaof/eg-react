/**
 * The global Redux store for the Browser.  All state that needs to be saved and restored in sessions belongs here.
 * 
 * @author Silas Hsu
 */
import { createStore, combineReducers, compose } from 'redux';
import { getGenomeConfig } from './model/genomes/allGenomes';
import DisplayedRegionModel from './model/DisplayedRegionModel';
import { AppStateSaver, AppStateLoader } from './model/AppSaveLoad';
import TrackModel from './model/TrackModel';
import RegionSet from './model/RegionSet';
import undoable from 'redux-undo';
import uuid from "uuid";
import { firebaseReducer, reactReduxFirebase } from 'react-redux-firebase';
import firebase from 'firebase/app';
import 'firebase/database';
import querySting from "query-string";
import _ from 'lodash';
import Json5Fetcher from './model/Json5Fetcher';
import DataHubParser from './model/DataHubParser';

export let STORAGE: any = window.sessionStorage;
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
export const SESSION_KEY = "eg-react-session";
export const NO_SAVE_SESSION = "eg-no-session"
export const MIN_VIEW_REGION_SIZE = 5;
export const DEFAULT_TRACK_LEGEND_WIDTH = 120;


export interface AppState {
    genomeName: string;
    viewRegion: DisplayedRegionModel;
    tracks: TrackModel[];
    metadataTerms: string[];
    regionSets: RegionSet[];
    regionSetView: RegionSet;
    trackLegendWidth: number;
    bundleId: string;
    sessionFromUrl?: boolean;
    isShowingNavigator: boolean;
    customTracksPool?: TrackModel[];
}

const bundleId = uuid.v1();

const initialState: AppState = {
    genomeName: "",
    viewRegion: null,
    tracks: [],
    metadataTerms: [],
    regionSets: [], // Available region sets, to be used for region set view
    regionSetView: null, // Region set backing current region set view, if applicable
    trackLegendWidth: DEFAULT_TRACK_LEGEND_WIDTH,
    bundleId,
    sessionFromUrl: false,
    isShowingNavigator: true,
    customTracksPool: [],
};

enum ActionType {
    SET_GENOME = "SET_GENOME",
    SET_VIEW_REGION = "SET_VIEW_REGION",
    SET_TRACKS = "SET_TRACKS",
    SET_METADATA_TERMS = "SET_METADATA_TERMS",
    SET_REGION_SET_LIST = "SET_REGION_SET_LIST",
    SET_REGION_SET_VIEW = "SET_REGION_SET_VIEW",
    SET_TRACK_LEGEND_WIDTH = "SET_TRACK_LEGEND_WIDTH",
    RESTORE_SESSION = "RESTORE_SESSION",
    RETRIEVE_BUNDLE = "RETRIEVE_BUNDLE",
    SET_GENOME_RESTORE_SESSION = "SET_GENOME_RESTORE_SESSION",
    TOGGLE_NAVIGATOR = "TOGGLE_NAVIGATOR",
    SET_CUSTOM_TRACKS_POOL = "SET_CUSTOM_TRACKS_POOL",
    SET_TRACKS_CUSTOM_TRACKS_POOL = "SET_TRACKS_CUSTOM_TRACKS_POOL",
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

    restoreSession: (sessionState: object) => {
        return {type: ActionType.RESTORE_SESSION, sessionState};
    },

    retrieveBundle: (bundleId: string) => {
        return {type: ActionType.RETRIEVE_BUNDLE, bundleId};
    },

    setGenomeRestoreSession: (genomeName: string, sessionState: object) => {
        return {type: ActionType.SET_GENOME_RESTORE_SESSION, genomeName, sessionState};
    },

    toggleNavigator: () => {
        return {type: ActionType.TOGGLE_NAVIGATOR}
    },

    setCustomTracksPool: (customTracksPool: TrackModel[]) => {
        return {type: ActionType.SET_CUSTOM_TRACKS_POOL, customTracksPool};
    },

    setTracksCustomTracksPool: (tracks: TrackModel[], customTracksPool: TrackModel[]) => {
        return {type: ActionType.SET_TRACKS_CUSTOM_TRACKS_POOL, tracks, customTracksPool};
    },

};

function getInitialState() {
    let state = initialState;
    
    const { query } = querySting.parseUrl(window.location.href);
    let newState;
    if (!(_.isEmpty(query))) {
        if (query.bundle) {
            newState = {...state, bundleId: query.bundle, sessionFromUrl: true};
        }
        if(query.session) {
            window.location.href = 
`http://epigenomegateway.wustl.edu/legacy/?genome=${query.genome}&session=${query.session}&statusId=${query.statusId}`;
        }
        if(query.datahub) {
            if(query.coordinate) {
                window.location.href = 
                `http://epigenomegateway.wustl.edu/legacy/?` +
                `genome=${query.genome}&datahub=${query.datahub}&coordinate=${query.coordinate}`;
            }else {
                window.location.href = 
                `http://epigenomegateway.wustl.edu/legacy/?genome=${query.genome}&datahub=${query.datahub}`;
            }
        }
        if(query.publichub) {
            window.location.href = 
`http://epigenomegateway.wustl.edu/legacy/?genome=${query.genome}&publichub=${query.publichub}`;
        }
        if(query.genome) {
            newState = getNextState(state, {type: ActionType.SET_GENOME, genomeName: query.genome});
        }
        if(query.hicUrl) {
            const tmpState = getNextState(state, {type: ActionType.SET_GENOME, genomeName: query.genome});
            const urlComponets = query.hicUrl.split('/');
            const track = TrackModel.deserialize(
                {type: "hic", url: query.hicUrl, name: urlComponets[urlComponets.length - 1].split('.')[0]});
            newState =  {...tmpState, tracks: [track]};
        }
        if(query.position) {
            const interval = newState.viewRegion.getNavigationContext().parse(query.position);
            newState = getNextState(newState, {type: ActionType.SET_VIEW_REGION, ...interval});
        }
        return newState || state;
    }
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
        case ActionType.RESTORE_SESSION:
            return new AppStateLoader().fromObject(action.sessionState);
        case ActionType.RETRIEVE_BUNDLE:
            return { ...prevState, bundleId: action.bundleId };
        case ActionType.SET_GENOME_RESTORE_SESSION:
            const state = new AppStateLoader().fromObject(action.sessionState);
            return {...state, genomeName: action.genomeName};
        case ActionType.TOGGLE_NAVIGATOR:
            return {...prevState, isShowingNavigator: !prevState.isShowingNavigator};
        case ActionType.SET_TRACKS_CUSTOM_TRACKS_POOL:
            const tracks = [...prevState.tracks, ...action.tracks];
            return { ...prevState, tracks, customTracksPool: action.customTracksPool };
        case ActionType.SET_CUSTOM_TRACKS_POOL:
            return { ...prevState, customTracksPool: action.customTracksPool };
        default:
            // console.warn("Unknown change state action; ignoring.");
            // console.warn(action);
            return prevState;
    }
}

async function getTracksFromHubURL(url: string): Promise<any> {
    const json = await new Json5Fetcher().get(url);
    const hubParser = new DataHubParser();
    return await hubParser.getTracksInHub(json, 'URL hub', false, 0);
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
    browser: undoable(getNextState, {limit: 20} ),
    firebase: firebaseReducer,
});


// Firebase config
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  }
  firebase.initializeApp(firebaseConfig)
  
  // react-redux-firebase options
  const config = {
    userProfile: 'users', // firebase root where user profiles are stored
    enableLogging: false, // enable/disable Firebase's database logging
  };
  
  // Add redux Firebase to compose
  const createStoreWithFirebase = compose(
    reactReduxFirebase(firebase, config)
  )(createStore);

// OK, so it's really an AppStore, but then that would mean something completely different 😛
export const AppState = createStoreWithFirebase(
    rootReducer,
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()
);

async function asyncInitState() {
    const { query } = querySting.parseUrl(window.location.href);
    if (!(_.isEmpty(query))) {
        if(query.hub) {
            const customTracksPool = await getTracksFromHubURL(query.hub);
            if (customTracksPool) {
                const tracks = customTracksPool.filter((track: any) => track.showOnHubLoad);
                if (tracks.length > 0) {
                    AppState.dispatch(ActionCreators.setTracksCustomTracksPool(tracks, customTracksPool));
                } else {
                    AppState.dispatch(ActionCreators.setCustomTracksPool(customTracksPool));
                }
            }
        }
    }
}

asyncInitState();

window.addEventListener("beforeunload", () => {
    if ( !STORAGE.getItem(NO_SAVE_SESSION) ){
        const state = AppState.getState();
        if (state !== initialState) {
            const blob = new AppStateSaver().toJSON(state.browser.present);
            STORAGE.setItem(SESSION_KEY, blob);
        }
    }
});

export default AppState;
   