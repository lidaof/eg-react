/**
 * The global Redux store for the Browser.  All state that needs to be saved and restored in sessions belongs here.
 *
 * @author Silas Hsu
 * @author Daofeng Li
 *
 */
import { getGenomeContainerTitle } from "components/containerView/containerUtils";
import { uncompressString } from "components/ShareUI";
import * as firebase from "firebase/app";
import "firebase/database";
import _ from "lodash";
import { GenomeConfig } from "model/genomes/GenomeConfig";
import querySting from "query-string";
import { firebaseReducer, reactReduxFirebase } from "react-redux-firebase";
import { combineReducers, compose, createStore } from "redux";
import undoable from "redux-undo";
import SnackbarEngine from "SnackbarEngine";
import uuid from "uuid";
import { HighlightInterval } from "./components/trackContainers/HighlightMenu";
import { AppStateLoader, AppStateSaver } from "./model/AppSaveLoad";
import DataHubParser from "./model/DataHubParser";
import DisplayedRegionModel from "./model/DisplayedRegionModel";
import { getGenomeConfig } from "./model/genomes/allGenomes";
import Chromosome from "./model/genomes/Chromosome";
import { Genome } from "./model/genomes/Genome";
import OpenInterval from "./model/interval/OpenInterval";
import Json5Fetcher from "./model/Json5Fetcher";
import RegionSet from "./model/RegionSet";
import TrackModel, { mapUrl } from "./model/TrackModel";

export let STORAGE: any = window.sessionStorage;
if (process.env.NODE_ENV === "test") {
    // jsdom doesn't support local storage.  Use a mock.
    const storage = {};

    STORAGE = {
        setItem(key: string, value: any) {
            storage[key] = value || "";
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
        },
    };
}
export const SESSION_KEY = "eg-react-session";
export const NO_SAVE_SESSION = "eg-no-session";
export const MIN_VIEW_REGION_SIZE = 5;
export const DEFAULT_TRACK_LEGEND_WIDTH = 120;

// if need change, also need change css variable in
const DARK_FG_COLOR = "white";
const DARK_BG_COLOR = "#222";
const LIGHT_FG_COLOR = "#222";
const LIGHT_BG_COLOR = "white";

export function getFgColor(isDark: boolean) {
    return isDark ? DARK_FG_COLOR : LIGHT_FG_COLOR;
}

export function getBgColor(isDark: boolean) {
    return isDark ? DARK_BG_COLOR : LIGHT_BG_COLOR;
}

export interface AppState {
    genomeName: string;

    containers: SyncedContainer[];

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
    highlights?: HighlightInterval[];
    // TODO: add support for "compatability mode" which won't use the new containers/multiple genome support.
    compatabilityMode: boolean;
    darkTheme?: boolean;
    editTarget: [number, number] // [containerIdx, genomeIdx];
    g3dTracks: G3DTrackInfo[];
}

// state for a single genome.
export interface GenomeState {
    name: string;
    title: string;
    tracks: TrackModel[];
    customTracksPool?: TrackModel[];
    genomeConfig?: GenomeConfig;

    // if nullable, the data starts off as null and uses the global values. these values can be overridden locally.
    highlights: HighlightInterval[] | null;

    regionSets: RegionSet[];
    regionSetView: RegionSet;

    settings: GenomeSettings;
}

export interface GenomeSettings {
    syncHighlights: boolean;

    offsetAmount: number;
}

export interface SyncedContainer {
    title: string;
    genomes: GenomeState[];

    viewRegion: DisplayedRegionModel;
    highlights: HighlightInterval[];
    metadataTerms: string[];
}

export interface G3DTrackInfo {
    track: TrackModel;
    location: [number, number] // [containerIdx, genomeIdx]
}

const bundleId = uuid.v1();
const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

const initialContainerSettings: GenomeSettings = {
    syncHighlights: true,

    offsetAmount: 0,
}

const initialContainer: SyncedContainer = {
    title: "",
    genomes: [],

    viewRegion: null,
    highlights: [],
    metadataTerms: [],
}

const getInitialContainerFromData = (name: string, viewRegion: DisplayedRegionModel, genome: GenomeState): SyncedContainer => {
    return {
        ...initialContainer,
        viewRegion,
        title: name,
        metadataTerms: [],
        genomes: [genome],
    }
}

const initialState: AppState = {
    genomeName: "",
    containers: [],

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
    layout: {},
    // g3dtracks: [],
    highlights: [],
    compatabilityMode: false,
    darkTheme: prefersDark,
    editTarget: [0, 0], // [containerIdx, genomeIdx];
    g3dTracks: []
};

enum ActionType {
    SET_GENOME = "SET_GENOME",
    SET_MULTIPLE_GENOMES = "SET_MULTIPLE_GENOMES",
    SET_MULTIPLE_GENOMES_WITH_CONTAINER = "SET_MULTIPLE_GENOMES_WITH_CONTAINER",
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
    TOGGLE_SHOWING_VR = "TOGGLE_SHOWING_VR",
    SET_CUSTOM_TRACKS_POOL = "SET_CUSTOM_TRACKS_POOL",
    SET_TRACKS_CUSTOM_TRACKS_POOL = "SET_TRACKS_CUSTOM_TRACKS_POOL",
    SET_CUSTOM_VIRUS_GENOME = "SET_CUSTOM_VIRUS_GENOME",
    SET_VIRUS_BROWSER_MODE = "SET_VIRUS_BROWSER_MODE",
    SET_HUB_SESSION_STORAGE = "SET_HUB_SESSION_STORAGE",
    SET_LAYOUT = "SET_LAYOUT",
    // SET_G3D_TRACKS = "SET_G3D_TRACKS",
    SET_HIGHLIGHTS = "SET_HIGHLIGHTS",
    SET_GENOME_SETTINGS = "SET_GENOME_SETTINGS",
    SET_GENOME_CONTAINER = "SET_GENOME_CONTAINER",
    SET_TITLE = "SET_TITLE",
    CREATE_NEW_CONTAINER = "CREATE_NEW_CONTAINER",
    SET_DARK_THEME = "SET_DARK_THEME",
    SET_EDIT_TARTGET = "SET_EDIT_TARGET",
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

    setMultipleGenomes: (genomeNames: string[]) => {
        return { type: ActionType.SET_MULTIPLE_GENOMES, genomeNames };
    },

    setMultipleGenomesWithContainer: (containers: string[][]) => {
        return { type: ActionType.SET_MULTIPLE_GENOMES_WITH_CONTAINER, containers };
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
            sessionState,
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

    setTracksCustomTracksPool: (
        tracks: TrackModel[],
        customTracksPool: TrackModel[],
        withDefaultTracks: boolean = true
    ) => {
        return {
            type: ActionType.SET_TRACKS_CUSTOM_TRACKS_POOL,
            tracks,
            customTracksPool,
            withDefaultTracks,
        };
    },

    setHubSessionStorage: (state: AppState, customTracksPool: TrackModel[]) => {
        return {
            type: ActionType.SET_HUB_SESSION_STORAGE,
            state,
            customTracksPool,
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
            layout,
        };
    },

    // setThreedTracks: (newTracks: TrackModel[]) => {
    //     return { type: ActionType.SET_G3D_TRACKS, threedTracks: newTracks };
    // },

    /**
     * Action for updating state for highlight items
     * @param highlights array of HighlightItems that are created in HighlightMenu.js
     * @returns
     */
    setHighlights: (highlights: HighlightInterval[]) => {
        // console.log(highlights);
        return { type: ActionType.SET_HIGHLIGHTS, highlights };
    },

    setDarkTheme: (darkTheme: boolean) => {
        return { type: ActionType.SET_DARK_THEME, darkTheme };
    },

    setEditTarget: (editTarget: number[]) => {
        return { type: ActionType.SET_EDIT_TARTGET, editTarget };
    }
};

export const ContainerActionsCreatorsFactory = (containerIdx: number) => {
    // TODO: reorganize and change the comments
    return {
        /**
         * Modifies the current genome.
         *
         * @param {string} genomeName - name of the genome
         */
        setGenome: (genomeName: string) => {
            return { containerIdx, type: ActionType.SET_GENOME, genomeName };
        },

        setViewRegion: (newStart: number, newEnd: number) => {
            return { containerIdx, type: ActionType.SET_VIEW_REGION, start: newStart, end: newEnd };
        },

        setTracks: (newTracks: TrackModel[], genomeIdx?: number) => {
            return { containerIdx, genomeIdx, type: ActionType.SET_TRACKS, tracks: newTracks };
        },

        setMetadataTerms: (newTerms: string[], genomeIdx?: number) => {
            return { containerIdx, genomeIdx, type: ActionType.SET_METADATA_TERMS, terms: newTerms };
        },

        /**
         * Replaces the list of available region sets with a new one.
         *
         * @param {RegionSet[]} list - new region set list
         */
        setRegionSetList: (list: RegionSet[]) => {
            return { containerIdx, type: ActionType.SET_REGION_SET_LIST, list };
        },

        /**
         * Enters or exit region set view with a particular region set.  If null/undefined, exits region set view.
         *
         * @param {RegionSet} [set] - set with which to enter region set view, or null to exit region set view
         */
        setRegionSetView: (set: RegionSet) => {
            return { containerIdx, type: ActionType.SET_REGION_SET_VIEW, set };
        },

        setTrackLegendWidth: (width: number) => {
            return { containerIdx, type: ActionType.SET_TRACK_LEGEND_WIDTH, width };
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
                sessionState,
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

        setTracksCustomTracksPool: (
            tracks: TrackModel[],
            customTracksPool: TrackModel[],
            withDefaultTracks: boolean = true
        ) => {
            return {
                containerIdx,
                type: ActionType.SET_TRACKS_CUSTOM_TRACKS_POOL,
                tracks,
                customTracksPool,
                withDefaultTracks,
            };
        },

        setHubSessionStorage: (state: AppState, customTracksPool: TrackModel[]) => {
            return {
                type: ActionType.SET_HUB_SESSION_STORAGE,
                state,
                customTracksPool,
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
                layout,
            };
        },

        // setThreedTracks: (newTracks: TrackModel[]) => {
        //     return { type: ActionType.SET_G3D_TRACKS, threedTracks: newTracks };
        // },

        /**
         * Action for updating state for highlight items
         * @param highlights array of HighlightItems that are created in HighlightMenu.js
         * @returns
         */
        setHighlights: (highlights: HighlightInterval[], genomeIdx?: number) => {
            // console.log(highlights);
            return { containerIdx, genomeIdx, type: ActionType.SET_HIGHLIGHTS, highlights };
        },

        /**
         * Replaces the current settings for a genome inside of a container with new settings.
         *
         * @param {GenomeSettings} settings - new region set list
         * @param {number} genomeIdx - index of the genome in the container
         */
        setGenomeSettings: (settings: GenomeSettings, genomeIdx: number) => {
            return { containerIdx, genomeIdx, type: ActionType.SET_GENOME_SETTINGS, settings };
        },

        /**
        * Moves the specified genome to a new container at containerIdx
        *
        * @param {number} genomeIdx - index of the genome in the container
        */
        setGenomeContainer: (genomeIdx: number, newContainerIdx: number) => {
            return { containerIdx, genomeIdx, newContainerIdx, type: ActionType.SET_GENOME_CONTAINER };
        },

        /**
         * Edits the title for containers or genomes.
         * 
         * @param {string} title - new title
         * @param {number} [genomeIdx] - index of the genome in the container. If not specified, the title is applied to the container.
         */
        setTitle: (title: string, genomeIdx?: number) => {
            return { containerIdx, genomeIdx, type: ActionType.SET_TITLE, title };
        },

        /**
         * Creates a new container and moves the specified genome to it.
         * @param {number} genomeIdx - index of the genome in the container
         */
        createNewContainer(genomeIdx: number) {
            return { containerIdx, genomeIdx, type: ActionType.CREATE_NEW_CONTAINER };
        }
    };
};

function getInitialState(): AppState {
    let state = initialState;

    const { query } = querySting.parseUrl(window.location.href);
    let newState;
    if (!_.isEmpty(query)) {
        if (query.session) {
            window.location.href = `http://epigenomegateway.wustl.edu/legacy/?genome=${query.genome}&session=${query.session}&statusId=${query.statusId}`;
        }
        if (query.datahub) {
            if (query.coordinate) {
                window.location.href =
                    `http://epigenomegateway.wustl.edu/legacy/?` +
                    `genome=${query.genome}&datahub=${query.datahub}&coordinate=${query.coordinate}`;
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
                genomeName: query.genome,
            });
        }
        if (query.bundle) {
            if (query.genome) {
                newState = { ...newState, bundleId: query.bundle, sessionFromUrl: true };
            } else {
                newState = { ...state, bundleId: query.bundle, sessionFromUrl: true };
            }
        }
        if (query.blob) {
            const json = JSON.parse(uncompressString(query.blob));
            newState = new AppStateLoader().fromObject(json);
        }
        if (query.hicUrl) {
            const tmpState = getNextState(state, {
                type: ActionType.SET_GENOME,
                genomeName: query.genome,
            });
            const urlComponets = (query.hicUrl as string).split("/");
            const track = TrackModel.deserialize({
                type: "hic",
                url: query.hicUrl,
                name: urlComponets[urlComponets.length - 1].split(".")[0],
            });
            newState = { ...tmpState, tracks: [track] };
        }
        if (query.position) {
            if (newState) {
                const interval = newState.viewRegion.getNavigationContext().parse(query.position as string);
                newState = getNextState(newState as AppState, {
                    type: ActionType.SET_VIEW_REGION,
                    ...interval,
                });
            }
        }
        if (query.virusBrowserMode) {
            const tmpState = getNextState(state, {
                type: ActionType.SET_GENOME,
                genomeName: query.genome,
            });
            newState = getNextState(tmpState, {
                type: ActionType.SET_VIRUS_BROWSER_MODE,
            });
        }
        return (newState as AppState) || (state as AppState);
    }
    const blob = STORAGE.getItem(SESSION_KEY);
    if (blob) {
        try {
            state = new AppStateLoader().fromJSON(blob);
            if (state.containers && state.containers.length) SnackbarEngine.success("Restored last session");
        } catch (error) {
            console.error("Session restored");
            console.error(error);
        }
    }
    if (!state.editTarget) state.editTarget = [0, 0];
    return state;
}

function getNextState(prevState: AppState, action: AppAction): AppState {
    console.log("🚀 ~ file: AppState.ts ~ line 619 ~ getNextState ~ action", action);
    if (!prevState) {
        return getInitialState();
    }
    switch (action.type) {
        case ActionType.SET_GENOME: { // Setting genome resets state.
            const { genomeName } = action;
            if (!genomeName) {
                return {
                    ...initialState,
                    darkTheme: prevState.darkTheme,
                };
            }
            let nextViewRegion = null;
            let nextTracks: TrackModel[] = [];
            const genomeConfig = getGenomeConfig(genomeName);
            if (genomeConfig) {
                nextViewRegion = new DisplayedRegionModel(genomeConfig.navContext, ...genomeConfig.defaultRegion);
                nextTracks = genomeConfig.defaultTracks;
            }
            return {
                ...initialState,
                ...getSetGenomeObject(genomeName),
                containers: [getInitialContainerFromData(genomeName, nextViewRegion, {
                    name: genomeName,
                    title: genomeName,
                    tracks: nextTracks,

                    highlights: [],
                    regionSets: [],
                    regionSetView: null,
                    settings: initialContainerSettings,
                    genomeConfig
                })],
                darkTheme: prevState.darkTheme
            };
        }
        case ActionType.SET_MULTIPLE_GENOMES: {
            const { genomeNames } = action;
            const genomeContainers: SyncedContainer[] = genomeNames.map((name: string) => {
                let nextViewRegion = null;
                let nextTracks: TrackModel[] = [];
                const genomeConfig = getGenomeConfig(name);
                const {
                    navContext,
                    defaultRegion,
                    defaultTracks,
                    // genome,
                    // cytobands,
                    // publicHubData,
                    // publicHubList,
                    // annotationTracks,
                    // twoBitURL,
                } = genomeConfig;
                if (genomeConfig) {
                    nextViewRegion = new DisplayedRegionModel(navContext, ...defaultRegion);
                    nextTracks = defaultTracks;
                }
                return getInitialContainerFromData(name, nextViewRegion, {
                    name: name,
                    title: name,
                    tracks: nextTracks,

                    highlights: [],
                    regionSets: [],
                    regionSetView: null,
                    settings: initialContainerSettings,
                    genomeConfig,
                });
            });
            return {
                ...initialState,
                ...getSetGenomeObject(genomeNames[0]),
                containers: genomeContainers,
                darkTheme: prevState.darkTheme
            }
        }
        case ActionType.SET_CUSTOM_VIRUS_GENOME: { // Setting virus genome. // TODO: allow to use with containers
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
                twoBitURL: "",
                fastaSeq: action.seq,
                annotationTracks,
            };
            return {
                ...initialState,
                genomeName: action.name,
                viewRegion: virusViewRegion,
                tracks: virusTracks,
                genomeConfig: virusGenomeConfig,
            };
        }
        case ActionType.SET_VIEW_REGION: {
            let { start, end, containerIdx } = action;
            if (!prevState.containers[containerIdx].viewRegion) {
                return prevState;
            }

            const newLength = end - start;
            if (newLength < MIN_VIEW_REGION_SIZE) {
                const amountToExpand = 0.5 * (MIN_VIEW_REGION_SIZE - newLength);
                start -= amountToExpand;
                end += amountToExpand;
            }
            const newRegion = prevState.containers[containerIdx].viewRegion.clone().setRegion(start, end);
            return {
                ...prevState,
                containers: modifyArrayAtIdx(prevState.containers, containerIdx, (c => {
                    return {
                        ...c,
                        viewRegion: newRegion,
                    }
                }))
            }
        }
        case ActionType.SET_TRACKS: {
            const { tracks, containerIdx, genomeIdx } = action;

            let cidx: number, gidx: number;
            if (containerIdx) {
                cidx = containerIdx;
                gidx = genomeIdx;
            } else {
                [cidx, gidx] = prevState.editTarget;
            }
            return {
                ...prevState,
                tracks: tracks.filter((t: TrackModel) => t.type === "g3d"),
                g3dTracks: [...prevState.g3dTracks, ...tracks.filter((t: TrackModel) => t.type === "g3d").map((t: TrackModel) => {
                    return {
                        track: t,
                        location: [cidx, gidx],
                    };
                })],
                containers: modifyArrayAtIdx(prevState.containers, cidx, (c => {
                    return {
                        ...c,
                        genomes: modifyArrayAtIdx(c.genomes, gidx, (g => {
                            return {
                                ...g,
                                tracks,
                            };
                        }))
                    }
                })),
            };
        }
        case ActionType.SET_METADATA_TERMS:
            const { terms, containerIdx, } = action;
            return {
                ...prevState,
                containers: modifyArrayAtIdx(prevState.containers, containerIdx, (c => {
                    return {
                        ...c,
                        metadataTerms: terms,
                    }
                }))
            };
        case ActionType.SET_REGION_SET_LIST:
            const [cidx, gidx] = prevState.editTarget;

            return {
                ...prevState,
                containers: modifyArrayAtIdx(prevState.containers, cidx, (c => {
                    return {
                        ...c,
                        genomes: modifyArrayAtIdx(c.genomes, gidx, (g => {
                            return {
                                ...g,
                                regionSetList: action.regionSetList,
                            };
                        }))
                    }
                })),
            };
        case ActionType.SET_REGION_SET_VIEW:
            return handleRegionSetViewChange(prevState, action.set);
        case ActionType.SET_TRACK_LEGEND_WIDTH:
            return { ...prevState, trackLegendWidth: action.width };
        case ActionType.RESTORE_SESSION:
            const sessionState = new AppStateLoader().fromObject(action.sessionState);
            // TODO: warn the user that their local work is about to be overwritten
            // allow them to undo.
            if (!sessionState.bundleId) {
                return { ...sessionState, bundleId: uuid.v1() };
            }
            return sessionState;
        case ActionType.RETRIEVE_BUNDLE:
            return { ...prevState, bundleId: action.bundleId };
        case ActionType.SET_GENOME_RESTORE_SESSION:
            const state = new AppStateLoader().fromObject(action.sessionState);
            return { ...state, genomeName: action.genomeName };
        case ActionType.TOGGLE_NAVIGATOR:
            return {
                ...prevState,
                isShowingNavigator: !prevState.isShowingNavigator,
            };
        case ActionType.TOGGLE_SHOWING_VR:
            return {
                ...prevState,
                isShowingVR: !prevState.isShowingVR,
            };
        case ActionType.SET_TRACKS_CUSTOM_TRACKS_POOL:
            const tracks = action.withDefaultTracks ? [...prevState.tracks, ...action.tracks] : [...action.tracks];
            return {
                ...prevState,
                tracks,
                customTracksPool: action.customTracksPool,
            };
        case ActionType.SET_CUSTOM_TRACKS_POOL:
            return { ...prevState, customTracksPool: action.customTracksPool };
        case ActionType.SET_HUB_SESSION_STORAGE:
            return {
                ...action.state,
                customTracksPool: action.customTracksPool,
            };
        case ActionType.SET_VIRUS_BROWSER_MODE:
            return {
                ...prevState,
                virusBrowserMode: true,
            };
        case ActionType.SET_LAYOUT:
            return { ...prevState, layout: action.layout };
        // case ActionType.SET_G3D_TRACKS:
        //     return { ...prevState, threedTracks: action.tracks };
        case ActionType.SET_HIGHLIGHTS: {
            const { highlights, containerIdx, genomeIdx } = action;

            if (isNaN(genomeIdx)) {
                return {
                    ...prevState,
                    containers: modifyArrayAtIdx(prevState.containers, containerIdx, (c => {
                        return {
                            ...c,
                            highlights: highlights
                        }
                    }))
                }
            }

            return {
                ...prevState,
                containers: modifyArrayAtIdx(prevState.containers, containerIdx, (c => {
                    return {
                        ...c,
                        genomes: modifyArrayAtIdx(c.genomes, genomeIdx, (g => {
                            return {
                                ...g,
                                highlights,
                            };
                        }))
                    }
                }))
            };
        }
        case ActionType.SET_GENOME_SETTINGS: { // TODO: don't allow a genome to be moved if it has a 3d genome linked to it
            const { settings, containerIdx, genomeIdx } = action;

            if (prevState.g3dTracks.some(({ location: [cidx, gidx] }) => {
                return cidx === containerIdx && gidx === genomeIdx;
            })) {
                SnackbarEngine.error("You can't move a genome which is linked to a 3d genome!");
                return prevState;
            }

            return {
                ...prevState,
                containers: modifyArrayAtIdx(prevState.containers, containerIdx, (c => {
                    return {
                        ...c,
                        genomes: modifyArrayAtIdx(c.genomes, genomeIdx, (g => {
                            return {
                                ...g,
                                settings,
                            };
                        }))
                    }
                }))
            };
        }
        case ActionType.SET_GENOME_CONTAINER: {
            const { containerIdx, newContainerIdx, genomeIdx } = action;
            const curGenome: GenomeState = prevState.containers[containerIdx].genomes[genomeIdx];
            // TODO: update editing target 
            return {
                ...prevState,
                containers: prevState.containers.map((c, idx) => {
                    if (idx === newContainerIdx) {
                        return {
                            ...c,
                            genomes: [...c.genomes, curGenome],
                        };
                    }
                    if (idx === containerIdx) {
                        return {
                            ...c,
                            genomes: c.genomes.filter((_g, idx) => idx !== - genomeIdx),
                        };
                    }
                    return c;
                }).filter(c => c.genomes.length)
            }
        }
        case ActionType.SET_TITLE: {
            const { title, containerIdx, genomeIdx } = action;

            if (genomeIdx !== undefined) {
                return {
                    ...prevState,
                    containers: modifyArrayAtIdx(prevState.containers, containerIdx, (c => {
                        return {
                            ...c,
                            genomes: modifyArrayAtIdx(c.genomes, genomeIdx, (g => {
                                return {
                                    ...g,
                                    title,
                                };
                            })),
                        }
                    }))
                };
            } else {
                return {
                    ...prevState,
                    containers: modifyArrayAtIdx(prevState.containers, containerIdx, (c => {
                        return {
                            ...c,
                            title,
                        }
                    }))
                };
            }
        }
        case ActionType.CREATE_NEW_CONTAINER: {
            const { containerIdx, genomeIdx } = action;
            // TODO: update editing target
            const newContainer: SyncedContainer = {
                ...prevState.containers[containerIdx],
                title: prevState.containers[containerIdx].genomes[genomeIdx].name,
                genomes: [...prevState.containers[containerIdx].genomes].filter((_g, idx) => idx === genomeIdx),
            }
            return {
                ...prevState,
                containers: [...modifyArrayAtIdx(prevState.containers, containerIdx, (c => {
                    return {
                        ...c,
                        genomes: c.genomes.filter((_g: any, idx: any) => idx !== genomeIdx),
                    }
                })), newContainer],
            }
        }
        case ActionType.SET_MULTIPLE_GENOMES_WITH_CONTAINER: {
            const { containers } = action;

            return {
                ...initialState,
                ...getSetGenomeObject(containers[0][0]),
                darkTheme: prevState.darkTheme,
                containers: containers.map((containerGenomes: string[]) => {
                    let nextViewRegion = null;
                    const {
                        navContext,
                        defaultRegion,
                        // genome,
                        // cytobands,
                        // publicHubData,
                        // publicHubList,
                        // annotationTracks,
                        // twoBitURL,
                    } = getGenomeConfig(containerGenomes[0]);
                    if (config) {
                        nextViewRegion = new DisplayedRegionModel(navContext, ...defaultRegion);
                    }

                    return {
                        ...initialContainer,
                        viewRegion: nextViewRegion,
                        title: getGenomeContainerTitle(containerGenomes),
                        genomes: containerGenomes.map(name => {
                            let nextTracks: TrackModel[] = [];
                            const genomeConfig = getGenomeConfig(name);
                            const {
                                defaultTracks,
                                // genome,
                                // cytobands,
                                // publicHubData,
                                // publicHubList,
                                // annotationTracks,
                                // twoBitURL,
                            } = genomeConfig;
                            if (genomeConfig) {
                                nextTracks = defaultTracks;
                            }

                            return {
                                name: name,
                                title: name,
                                tracks: nextTracks,

                                highlights: [],

                                settings: initialContainerSettings,
                                genomeConfig
                            };
                        }),
                    }
                })
            }
        }
        case ActionType.SET_DARK_THEME:
            return { ...prevState, darkTheme: action.darkTheme };
        case ActionType.SET_EDIT_TARTGET:
            return { ...prevState, editTarget: action.editTarget };
        default:
            // console.warn("Unknown change state action; ignoring.");
            // console.warn(action);
            return prevState;
    }
}

// takes an array and index, and a function that takes the array element and returns a new element
function modifyArrayAtIdx(oldContainers: any[], targetIdx: number, modify: (c: any) => any) {
    return oldContainers.map((c, cIdx) => {
        if (targetIdx === cIdx) {
            return modify(c);
        }
        return c;
    })
}

function getSetGenomeObject(genomeName: string) {
    let nextViewRegion = null;
    let nextTracks: TrackModel[] = [];
    const genomeConfig = getGenomeConfig(genomeName);
    if (genomeConfig) {
        nextViewRegion = new DisplayedRegionModel(genomeConfig.navContext, ...genomeConfig.defaultRegion);
        nextTracks = genomeConfig.defaultTracks;
    }
    return {
        ...initialState,
        genomeName: genomeName,
        viewRegion: nextViewRegion,
        tracks: nextTracks,
    };
}

// TODO
// function getSetVirusGenomeObject

async function getTracksFromHubURL(url: string): Promise<any> {
    const json = await new Json5Fetcher().get(url);
    const hubParser = new DataHubParser();
    return await hubParser.getTracksInHub(json, "URL hub", "", false, 0);
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
            viewRegion: new DisplayedRegionModel(nextSet.makeNavContext()),
        };
    } else {
        const genomeConfig = getGenomeConfig(prevState.genomeName);
        const nextViewRegion = genomeConfig
            ? new DisplayedRegionModel(genomeConfig.navContext, ...genomeConfig.defaultRegion)
            : null;
        return {
            ...prevState,
            regionSetView: null,
            viewRegion: nextViewRegion,
        };
    }
}

const rootReducer = !process.env.REACT_APP_NO_FIREBASE
    ? combineReducers({
        browser: undoable(getNextState, { limit: 20 }),
        firebase: firebaseReducer,
    })
    : combineReducers({
        browser: undoable(getNextState, { limit: 20 }),
    });

if (!process.env.REACT_APP_NO_FIREBASE) {
    // Firebase config
    const firebaseConfig = {
        apiKey: process.env.REACT_APP_FIREBASE_KEY,
        authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
        databaseURL: process.env.REACT_APP_FIREBASE_DATABASE,
        storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    };
    firebase.initializeApp(firebaseConfig);
}

// react-redux-firebase options
const config = {
    userProfile: "users", // firebase root where user profiles are stored
    enableLogging: false, // enable/disable Firebase's database logging
};

// Add redux Firebase to compose
const createStoreWithFirebase = !process.env.REACT_APP_NO_FIREBASE
    ? compose(reactReduxFirebase(firebase, config))(createStore)
    : createStore;

// OK, so it's really an AppStore, but then that would mean something completely different 😛
export const AppState = createStoreWithFirebase(
    rootReducer,
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()
);

async function asyncInitState() {
    const { query } = querySting.parseUrl(window.location.href);
    if (!_.isEmpty(query)) {
        if (query.hub) {
            const withDefaultTracks = !query.noDefaultTracks || (query.noDefaultTracks ? false : true);
            const customTracksPool = await getTracksFromHubURL(mapUrl(query.hub as string));
            if (customTracksPool) {
                const tracks = customTracksPool.filter((track: any) => track.showOnHubLoad);
                if (tracks.length > 0) {
                    AppState.dispatch(
                        ActionCreators.setTracksCustomTracksPool(tracks, customTracksPool, withDefaultTracks)
                    );
                } else {
                    AppState.dispatch(ActionCreators.setCustomTracksPool(customTracksPool));
                }
            }
        }
        if (query.sessionFile) {
            const json = await new Json5Fetcher().get(mapUrl(query.sessionFile as string));
            if (json) {
                AppState.dispatch(ActionCreators.restoreSession(json));
                // when position in URL with sessionFile, see issue #245
                if (query.position) {
                    const state = new AppStateLoader().fromObject(json);
                    const interval = state.viewRegion.getNavigationContext().parse(query.position as string);
                    AppState.dispatch(ActionCreators.setViewRegion(interval.start, interval.end));
                }
            }
        }
        if (query.hubSessionStorage) {
            const customTracksPool = await getTracksFromHubURL(mapUrl(query.hubSessionStorage as string));
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
                                AppState.dispatch(
                                    ActionCreators.setTracksCustomTracksPool(tracksInHub, customTracksPool)
                                );
                            } else {
                                AppState.dispatch(ActionCreators.setCustomTracksPool(customTracksPool));
                            }
                        }
                    } catch (error) {
                        console.error("Error restoring hub session storage");
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

window.addEventListener("beforeunload", () => {
    if (!STORAGE.getItem(NO_SAVE_SESSION)) {
        const state = AppState.getState();
        if (state !== initialState) {
            const blob = new AppStateSaver().toJSON(state.browser.present);
            STORAGE.setItem(SESSION_KEY, blob);
        }
    }
});

export default AppState;
