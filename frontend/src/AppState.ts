/**
 * The global Redux store for the Browser.  All state that needs to be saved and restored in sessions belongs here.
 *
 * @author Silas Hsu
 * @author Daofeng Li
 *
 */
import firebase from 'firebase/app';
import 'firebase/database';
import _ from 'lodash';
import querySting from 'query-string';
import { firebaseReducer, reactReduxFirebase } from 'react-redux-firebase';
import { combineReducers, compose, createStore } from 'redux';
import undoable from 'redux-undo';
import uuid from 'uuid';
import { AppStateLoader, AppStateSaver } from './model/AppSaveLoad';
import DataHubParser from './model/DataHubParser';
import DisplayedRegionModel from './model/DisplayedRegionModel';
import { getGenomeConfig } from './model/genomes/allGenomes';
import Chromosome from './model/genomes/Chromosome';
import { Genome } from './model/genomes/Genome';
import OpenInterval from './model/interval/OpenInterval';
import Json5Fetcher from './model/Json5Fetcher';
import RegionSet from './model/RegionSet';
import TrackModel from './model/TrackModel';

export let STORAGE: any = window.sessionStorage;
if (process.env.NODE_ENV === 'test') {
	// jsdom doesn't support local storage.  Use a mock.
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
export const SESSION_KEY = 'eg-react-session';
export const NO_SAVE_SESSION = 'eg-no-session';
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
	isShowingVR?: boolean;
	customTracksPool?: TrackModel[];
	genomeConfig?: object;
	virusBrowserMode?: boolean;
	layout?: object;
	// g3dtracks?: TrackModel[];
}

const bundleId = uuid.v1();

const initialState: AppState = {
	genomeName: '',
	viewRegion: null,
	tracks: [],
	metadataTerms: [],
	regionSets: [], // Available region sets, to be used for region set view
	regionSetView: null, // Region set backing current region set view, if applicable
	trackLegendWidth: DEFAULT_TRACK_LEGEND_WIDTH,
	bundleId,
	sessionFromUrl: false,
	isShowingNavigator: true,
	isShowingVR: false,
	customTracksPool: [],
	layout: {}
	// g3dtracks: [],
};

enum ActionType {
	SET_GENOME = 'SET_GENOME',
	SET_VIEW_REGION = 'SET_VIEW_REGION',
	SET_TRACKS = 'SET_TRACKS',
	SET_METADATA_TERMS = 'SET_METADATA_TERMS',
	SET_REGION_SET_LIST = 'SET_REGION_SET_LIST',
	SET_REGION_SET_VIEW = 'SET_REGION_SET_VIEW',
	SET_TRACK_LEGEND_WIDTH = 'SET_TRACK_LEGEND_WIDTH',
	RESTORE_SESSION = 'RESTORE_SESSION',
	RETRIEVE_BUNDLE = 'RETRIEVE_BUNDLE',
	SET_GENOME_RESTORE_SESSION = 'SET_GENOME_RESTORE_SESSION',
	TOGGLE_NAVIGATOR = 'TOGGLE_NAVIGATOR',
	TOGGLE_SHOWING_VR = 'TOGGLE_SHOWING_VR',
	SET_CUSTOM_TRACKS_POOL = 'SET_CUSTOM_TRACKS_POOL',
	SET_TRACKS_CUSTOM_TRACKS_POOL = 'SET_TRACKS_CUSTOM_TRACKS_POOL',
	SET_CUSTOM_VIRUS_GENOME = 'SET_CUSTOM_VIRUS_GENOME',
	SET_VIRUS_BROWSER_MODE = 'SET_VIRUS_BROWSER_MODE',
	SET_HUB_SESSION_STORAGE = 'SET_HUB_SESSION_STORAGE',
	SET_LAYOUT = 'SET_LAYOUT'
	// SET_G3D_TRACKS = "SET_G3D_TRACKS",
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
		return { type: ActionType.SET_GENOME, genomeName };
	},

	setViewRegion: (newStart: number, newEnd: number) => {
		return { type: ActionType.SET_VIEW_REGION, start: newStart, end: newEnd };
	},

	setTracks: (newTracks: TrackModel[]) => {
		return { type: ActionType.SET_TRACKS, tracks: newTracks };
	},

	setMetadataTerms: (newTerms: string[]) => {
		return { type: ActionType.SET_METADATA_TERMS, terms: newTerms };
	},

	/**
	 * Replaces the list of available region sets with a new one.
	 *
	 * @param {RegionSet[]} list - new region set list
	 */
	setRegionSetList: (list: RegionSet[]) => {
		return { type: ActionType.SET_REGION_SET_LIST, list };
	},

	/**
	 * Enters or exit region set view with a particular region set.  If null/undefined, exits region set view.
	 *
	 * @param {RegionSet} [set] - set with which to enter region set view, or null to exit region set view
	 */
	setRegionSetView: (set: RegionSet) => {
		return { type: ActionType.SET_REGION_SET_VIEW, set };
	},

	setTrackLegendWidth: (width: number) => {
		return { type: ActionType.SET_TRACK_LEGEND_WIDTH, width };
	},

	restoreSession: (sessionState: object) => {
		return { type: ActionType.RESTORE_SESSION, sessionState };
	},

	retrieveBundle: (bundleId: string) => {
		return { type: ActionType.RETRIEVE_BUNDLE, bundleId };
	},

	setGenomeRestoreSession: (genomeName: string, sessionState: object) => {
		return {
			type: ActionType.SET_GENOME_RESTORE_SESSION,
			genomeName,
			sessionState
		};
	},

	toggleNavigator: () => {
		return { type: ActionType.TOGGLE_NAVIGATOR };
	},

	toggleVR: () => {
		return { type: ActionType.TOGGLE_SHOWING_VR };
	},

	setCustomTracksPool: (customTracksPool: TrackModel[]) => {
		return { type: ActionType.SET_CUSTOM_TRACKS_POOL, customTracksPool };
	},

	setTracksCustomTracksPool: (tracks: TrackModel[], customTracksPool: TrackModel[], withDefaultTracks: boolean = true) => {
		return {
			type: ActionType.SET_TRACKS_CUSTOM_TRACKS_POOL,
			tracks,
			customTracksPool,
			withDefaultTracks
		};
	},

	setHubSessionStorage: (state: AppState, customTracksPool: TrackModel[]) => {
		return {
			type: ActionType.SET_HUB_SESSION_STORAGE,
			state,
			customTracksPool
		};
	},

	setCustomVirusGenome: (name: string, seqId: string, seq: string, tracks: any[], annTracks: any) => {
		return { type: ActionType.SET_CUSTOM_VIRUS_GENOME, name, seqId, seq, tracks, annTracks };
	},

	setVirusBrowserMode: () => {
		return { type: ActionType.SET_VIRUS_BROWSER_MODE };
	},

	setLayout: (layout: object) => {
		return {
			type: ActionType.SET_LAYOUT,
			layout
		};
	}

	// setThreedTracks: (newTracks: TrackModel[]) => {
	//     return { type: ActionType.SET_G3D_TRACKS, threedTracks: newTracks };
	// },
};

function getInitialState(): AppState {
	let state = initialState;
	const { query } = querySting.parseUrl(window.location.href);
	let newState;
	if (!_.isEmpty(query)) {
		// console.log(query);
		if (query.session) {
			window.location.href = `http://epigenomegateway.wustl.edu/legacy/?genome=${query.genome}&session=${query.session}&statusId=${query.statusId}`;
		}
		if (query.datahub) {
			if (query.coordinate) {
				window.location.href =
					`http://epigenomegateway.wustl.edu/legacy/?` + `genome=${query.genome}&datahub=${query.datahub}&coordinate=${query.coordinate}`;
			} else {
				window.location.href = `http://epigenomegateway.wustl.edu/legacy/?genome=${query.genome}&datahub=${query.datahub}`;
			}
		}
		if (query.publichub) {
			window.location.href = `http://epigenomegateway.wustl.edu/legacy/?genome=${query.genome}&publichub=${query.publichub}`;
		}
		if (query.genome) {
			newState = getNextState(state, {
				type: ActionType.SET_GENOME,
				genomeName: query.genome
			});
		}
		if (query.bundle) {
			if (query.genome) {
				newState = { ...newState, bundleId: query.bundle, sessionFromUrl: true };
			} else {
				newState = { ...state, bundleId: query.bundle, sessionFromUrl: true };
			}
		}
		if (query.hicUrl) {
			const tmpState = getNextState(state, {
				type: ActionType.SET_GENOME,
				genomeName: query.genome
			});
			const urlComponets = (query.hicUrl as string).split('/');
			const track = TrackModel.deserialize({
				type: 'hic',
				url: query.hicUrl,
				name: urlComponets[urlComponets.length - 1].split('.')[0]
			});
			newState = { ...tmpState, tracks: [track] };
		}
		if (query.position) {
			const interval = newState.viewRegion.getNavigationContext().parse(query.position as string);
			newState = getNextState(newState as AppState, {
				type: ActionType.SET_VIEW_REGION,
				...interval
			});
		}
		if (query.virusBrowserMode) {
			const tmpState = getNextState(state, {
				type: ActionType.SET_GENOME,
				genomeName: query.genome
			});
			newState = getNextState(tmpState, {
				type: ActionType.SET_VIRUS_BROWSER_MODE
			});
		}
		// console.log(newState);
		return (newState as AppState) || (state as AppState);
	}
	const blob = STORAGE.getItem(SESSION_KEY);
	if (blob) {
		try {
			state = new AppStateLoader().fromJSON(blob);
		} catch (error) {
			console.error('Error restoring session');
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
		case ActionType.SET_CUSTOM_VIRUS_GENOME: // Setting virus genome.
			const virusTracks = action.tracks.map((data: any) => TrackModel.deserialize(data));
			const genome = new Genome(action.name, [new Chromosome(action.seqId, action.seq.length)]);
			const navContext = genome.makeNavContext();
			const virusViewRegion = new DisplayedRegionModel(navContext);
			const defaultRegion = new OpenInterval(0, action.seq.length);
			const annotationTracks = JSON.parse(action.annTracks);
			const virusGenomeConfig = {
				genome,
				navContext,
				defaultRegion,
				cytobands: {},
				defaultTracks: virusTracks,
				twoBitURL: '',
				fastaSeq: action.seq,
				annotationTracks
			};
			return {
				...initialState,
				genomeName: action.name,
				viewRegion: virusViewRegion,
				tracks: virusTracks,
				genomeConfig: virusGenomeConfig
			};
		case ActionType.SET_VIEW_REGION:
			if (!prevState.viewRegion) {
				return prevState;
			}

			let { start, end } = action;
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
			return { ...state, genomeName: action.genomeName };
		case ActionType.TOGGLE_NAVIGATOR:
			return {
				...prevState,
				isShowingNavigator: !prevState.isShowingNavigator
			};
		case ActionType.TOGGLE_SHOWING_VR:
			return {
				...prevState,
				isShowingVR: !prevState.isShowingVR
			};
		case ActionType.SET_TRACKS_CUSTOM_TRACKS_POOL:
			const tracks = action.withDefaultTracks ? [...prevState.tracks, ...action.tracks] : [...action.tracks];
			return {
				...prevState,
				tracks,
				customTracksPool: action.customTracksPool
			};
		case ActionType.SET_CUSTOM_TRACKS_POOL:
			return { ...prevState, customTracksPool: action.customTracksPool };
		case ActionType.SET_HUB_SESSION_STORAGE:
			return {
				...action.state,
				customTracksPool: action.customTracksPool
			};
		case ActionType.SET_VIRUS_BROWSER_MODE:
			return {
				...prevState,
				virusBrowserMode: true
			};
		case ActionType.SET_LAYOUT:
			return { ...prevState, layout: action.layout };
		// case ActionType.SET_G3D_TRACKS:
		//     return { ...prevState, threedTracks: action.tracks };
		default:
			// console.warn("Unknown change state action; ignoring.");
			// console.warn(action);
			return prevState;
	}
}

async function getTracksFromHubURL(url: string): Promise<any> {
	const json = await new Json5Fetcher().get(url);
	const hubParser = new DataHubParser();
	return await hubParser.getTracksInHub(json, 'URL hub', '', false, 0);
}

/**
 * Handles a change in region set view.  Causes a change in the displayed region as well as region set.
 *
 * @param  prevState - previous redux store
 * @param  [nextSet] - region set to back region set view in the next state
 * @return next redux store
 */
function handleRegionSetViewChange(prevState: AppState, nextSet: RegionSet): AppState {
	if (nextSet) {
		return {
			...prevState,
			regionSetView: nextSet,
			viewRegion: new DisplayedRegionModel(nextSet.makeNavContext())
		};
	} else {
		const genomeConfig = getGenomeConfig(prevState.genomeName);
		const nextViewRegion = genomeConfig ? new DisplayedRegionModel(genomeConfig.navContext, ...genomeConfig.defaultRegion) : null;
		return {
			...prevState,
			regionSetView: null,
			viewRegion: nextViewRegion
		};
	}
}

const rootReducer = !process.env.REACT_APP_NO_FIREBASE
	? combineReducers({
			browser: undoable(getNextState, { limit: 20 }),
			firebase: firebaseReducer
	  })
	: combineReducers({
			browser: undoable(getNextState, { limit: 20 })
	  });

if (!process.env.REACT_APP_NO_FIREBASE) {
	// Firebase config
	const firebaseConfig = {
		apiKey: process.env.REACT_APP_FIREBASE_KEY,
		authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
		databaseURL: process.env.REACT_APP_FIREBASE_DATABASE,
		storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET
	};
	firebase.initializeApp(firebaseConfig);
}

// react-redux-firebase options
const config = {
	userProfile: 'users', // firebase root where user profiles are stored
	enableLogging: false // enable/disable Firebase's database logging
};

// Add redux Firebase to compose
const createStoreWithFirebase = !process.env.REACT_APP_NO_FIREBASE ? compose(reactReduxFirebase(firebase, config))(createStore) : createStore;

// OK, so it's really an AppStore, but then that would mean something completely different 😛
export const AppState = createStoreWithFirebase(rootReducer, (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__());

async function asyncInitState() {
	const { query } = querySting.parseUrl(window.location.href);
	if (!_.isEmpty(query)) {
		if (query.hub) {
			const withDefaultTracks = !query.noDefaultTracks || (query.noDefaultTracks ? false : true);
			const customTracksPool = await getTracksFromHubURL(query.hub as string);
			if (customTracksPool) {
				const tracks = customTracksPool.filter((track: any) => track.showOnHubLoad);
				if (tracks.length > 0) {
					AppState.dispatch(ActionCreators.setTracksCustomTracksPool(tracks, customTracksPool, withDefaultTracks));
				} else {
					AppState.dispatch(ActionCreators.setCustomTracksPool(customTracksPool));
				}
			}
		}
		if (query.sessionFile) {
			const json = await new Json5Fetcher().get(query.sessionFile as string);
			if (json) {
				AppState.dispatch(ActionCreators.restoreSession(json));
			}
		}
		if (query.hubSessionStorage) {
			const customTracksPool = await getTracksFromHubURL(query.hubSessionStorage as string);
			if (customTracksPool) {
				const tracksInHub = customTracksPool.filter((track: any) => track.showOnHubLoad);
				const blob = STORAGE.getItem(SESSION_KEY);
				if (blob) {
					try {
						const state = new AppStateLoader().fromJSON(blob);
						if (state.genomeName === query.genome) {
							const trackSets = new Set();
							state.tracks.forEach((t: any) => trackSets.add(t.url || t.label));
							const filteredTracks = tracksInHub.filter((t: any) => {
								if (t.url) {
									return !trackSets.has(t.url);
								} else if (t.label) {
									return !trackSets.has(t.label);
								} else {
									return true;
								}
							});
							const tracks = [...state.tracks, ...filteredTracks];
							const finalState = { ...state, tracks };
							AppState.dispatch(ActionCreators.setHubSessionStorage(finalState, customTracksPool));
						} else {
							//if url changed genome
							if (tracksInHub.length > 0) {
								AppState.dispatch(ActionCreators.setTracksCustomTracksPool(tracksInHub, customTracksPool));
							} else {
								AppState.dispatch(ActionCreators.setCustomTracksPool(customTracksPool));
							}
						}
					} catch (error) {
						console.error('Error restoring hub session storage');
						console.error(error);
					}
				} else {
					if (tracksInHub.length > 0) {
						AppState.dispatch(ActionCreators.setTracksCustomTracksPool(tracksInHub, customTracksPool));
					} else {
						AppState.dispatch(ActionCreators.setCustomTracksPool(customTracksPool));
					}
				}
			}
		}
		if (query.virusBrowserMode) {
			AppState.dispatch(ActionCreators.setVirusBrowserMode());
		}
	}
}

asyncInitState();

window.addEventListener('beforeunload', () => {
	if (!STORAGE.getItem(NO_SAVE_SESSION)) {
		const state = AppState.getState();
		if (state !== initialState) {
			const blob = new AppStateSaver().toJSON(state.browser.present);
			STORAGE.setItem(SESSION_KEY, blob);
		}
	}
});

export default AppState;
