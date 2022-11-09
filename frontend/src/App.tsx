import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { Offline } from "react-detect-offline";
import Notifications from "react-notify-toast";
import { connect } from "react-redux";
// import AppState, { ActionCreators } from "./AppState";
import AppState, { ActionCreators, GenomeState, SyncedContainer } from "./AppState";
import ContainerView from "./components/containerView/ContainerView";
import { Footer } from "./components/Footer";
import GenomePickerContainer from "./components/GenomePicker";
import LoadSession from "./components/LoadSession";
import Nav from "./components/nav/Nav";
import { HighlightInterval } from './components/trackContainers/HighlightMenu';
import DisplayedRegionModel from "./model/DisplayedRegionModel";
import { getGenomeConfig } from "./model/genomes/allGenomes";
import TrackModel from "./model/TrackModel";
import { getSecondaryGenomes, HELP_LINKS } from "./util";
// @ts-ignore
import { motion } from 'framer-motion/dist/framer-motion';

import "./App.css";
import { Tools } from "components/trackContainers/Tools";
import FloatingTools from "FloatingTools";
import { ToolbarClassKey } from "@material-ui/core";

function mapStateToProps(state: { browser: { present: AppState } }) {
    const appState = state.browser.present;
    const [cidx, gidx] = appState.editTarget;
    const { containers } = appState;
    const pickingGenome = !(containers && containers.length);

    let editingGenome = {} as GenomeState, editingContainer = {} as SyncedContainer;
    if (!pickingGenome) {
        editingGenome = (appState.containers && appState.containers[cidx].genomes[gidx]) || {} as GenomeState;
        editingContainer = (appState.containers && appState.containers[cidx]) || {} as SyncedContainer;
    }

    return {
        viewRegion: editingContainer.viewRegion,
        tracks: editingGenome.tracks || [],
        bundleId: appState.bundleId,
        sessionFromUrl: appState.sessionFromUrl,
        trackLegendWidth: appState.trackLegendWidth,
        isShowingNavigator: appState.isShowingNavigator,
        customTracksPool: editingGenome.customTracksPool,
        virusBrowserMode: appState.virusBrowserMode,
        highlights: editingGenome.highlights,

        containers: appState.containers,
        editTarget: appState.editTarget,
        genomeConfig: editingGenome.genomeConfig
    };
}

const callbacks = {
    onNewViewRegion: ActionCreators.setViewRegion,
    onTracksChanged: ActionCreators.setTracks,
    onLegendWidthChange: ActionCreators.setTrackLegendWidth,
    onSetHighlights: ActionCreators.setHighlights,
};

const withAppState = connect(mapStateToProps, callbacks);
const withEnhancements = _.flowRight(withAppState);

interface AppProps {
    viewRegion: DisplayedRegionModel;
    tracks: TrackModel[];
    bundleId: string;
    sessionFromUrl: string;
    onNewViewRegion: (region: DisplayedRegionModel) => void;
    onTracksChanged: (tracks: TrackModel[]) => void;
    embeddingMode: any;
    genomeConfig: any;
    publicTracksPool: any[];
    customTracksPool: any[];
    trackLegendWidth: any;
    onLegendWidthChange: any;
    isShowingNavigator: any;
    virusBrowserMode: any;
    layoutModel: any;
    onSetAnchors3d: any;
    onSetGeneFor3d: any;
    viewer3dNumFrames: any;
    isThereG3dTrack: any;
    onSetImageInfo: any;
    highlights: HighlightInterval[];
    onSetHighlights: (highlights: HighlightInterval[]) => void;

    containers: SyncedContainer[];
    editTarget: number[];
}

interface AppStateProps {
    highlightEnteredRegion: boolean;
    enteredRegion: any;
    highlightColor: string;
    publicHubs: { [genome: string]: any[] };
    publicTracksPool: { [genome: string]: any[] };
    customTracksPool: { [genome: string]: any[] };
    availableTrackSets: { [genome: string]: Set<string> };
    suggestedMetaSets: { [genome: string]: Set<string> };
    activeTool: typeof Tools.DRAG
}

// interface RGBAColor {
//     rgb: {
//         r: number;
//         g: number;
//         b: number;
//         a: number;
//     }
// }

class App extends React.PureComponent<AppProps, AppStateProps> {
    static propTypes = {
        genomeConfig: PropTypes.object,
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel),
        tracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)),
        onNewViewRegion: PropTypes.func,
        onTracksChanged: PropTypes.func,
        embeddingMode: PropTypes.bool,
    };

    constructor(props: AppProps) {
        super(props);
        this.state = {
            // isShowing3D: false,
            // isShowingNavigator: true,

            // parent state
            highlightEnteredRegion: true,
            enteredRegion: null,
            highlightColor: "rgba(255, 255, 0, 0.3)", // light yellow
            // publicHubs: [],
            // publicTracksPool: [],
            // customTracksPool: [],
            publicHubs: {},
            publicTracksPool: {},
            customTracksPool: {},
            // availableTrackSets: new Set(),
            // suggestedMetaSets: new Set(["Track type"]),
            availableTrackSets: {},
            suggestedMetaSets: {},
            activeTool: Tools.DRAG,
        };
        this.addTracksToPool = this.addTracksToPool.bind(this);
        this.addTracks = this.addTracks.bind(this);
        this.removeTrack = this.removeTrack.bind(this);
        this.updatePublicHubs = this.updatePublicHubs.bind(this);
        this.addTracktoAvailable = this.addTracktoAvailable.bind(this);
        this.removeTrackFromAvailable = this.removeTrackFromAvailable.bind(this);
        this.addTermToMetaSets = this.addTermToMetaSets.bind(this);
    }

    componentDidMount() {
        if (this.props.genomeConfig) {
            this.updateOtherPublicHubs(this.props.tracks);
        }
        this.initializeMetaSets(this.props.tracks);
        this.initialStateAllocate(this.props);
    }

    getCurrentGenomeName() {
        if (!this.props.containers ||
            !this.props.containers.length ||
            !this.props.containers[this.props.editTarget[0]].genomes ||
            !this.props.containers[this.props.editTarget[0]].genomes.length) {
            return null;
        }
        return this.props.containers[this.props.editTarget[0]].genomes[this.props.editTarget[1]].genomeConfig.genome.getName();
    }

    UNSAFE_componentWillReceiveProps(nextProps: AppProps) {
        const pickingGenome = !(nextProps.containers && nextProps.containers.length);
        if (pickingGenome) return;
        if ((!(this.props.containers && this.props.containers.length) && nextProps.containers.length) ||
            nextProps.editTarget[0] !== this.props.editTarget[0] ||
            nextProps.editTarget[1] !== this.props.editTarget[1]) {
            const nextGenomeConfig = nextProps.containers[nextProps.editTarget[0]].genomes[nextProps.editTarget[1]].genomeConfig;
            const gName = nextGenomeConfig.genome.getName();
            let newState: any = {};
            if (!this.state.publicHubs[gName]) {
                const publicHubs = (nextGenomeConfig.publicHubList || []).slice();
                publicHubs.forEach((x: { genome: any }) => (x.genome = gName));
                newState.publicHubs = {
                    ...this.state.publicHubs,
                    [gName]: publicHubs,
                };
            }
            if (!this.state.publicTracksPool[gName]) {
                newState.publicTracksPool = {
                    ...this.state.publicTracksPool,
                    [gName]: [],
                };
            }
            if (!this.state.suggestedMetaSets[gName]) {
                newState.suggestedMetaSets = {
                    ...this.state.suggestedMetaSets,
                    [gName]: new Set(["Track type"]),
                };
            }
            if (!this.state.availableTrackSets[gName]) {
                newState.availableTrackSets = {
                    ...this.state.availableTrackSets,
                    [gName]: new Set(),
                };
            }
            if (!this.state.customTracksPool[gName]) {
                newState.customTracksPool = {
                    ...this.state.customTracksPool,
                    [gName]: [],
                };
            }
            if (Object.keys(newState).length) {
                this.setState(newState);
            }
        }
        this.initializeMetaSets(nextProps.tracks);
    }

    initialStateAllocate(targetProps: any) {
        const pickingGenome = !(targetProps.containers && targetProps.containers.length);
        if (pickingGenome) return;
        if ((targetProps.containers.length) ||
            targetProps.editTarget[0] !== this.props.editTarget[0] ||
            targetProps.editTarget[1] !== this.props.editTarget[1]) {
            const nextGenomeConfig = targetProps.containers[targetProps.editTarget[0]].genomes[targetProps.editTarget[1]].genomeConfig;
            const gName = nextGenomeConfig.genome.getName();
            let newState: any = {};
            if (!this.state.publicHubs[gName]) {
                const publicHubs = (nextGenomeConfig.publicHubList || []).slice();
                publicHubs.forEach((x: { genome: any }) => (x.genome = gName));
                newState.publicHubs = {
                    ...this.state.publicHubs,
                    [gName]: publicHubs,
                };
            }
            if (!this.state.publicTracksPool[gName]) {
                newState.publicTracksPool = {
                    ...this.state.publicTracksPool,
                    [gName]: [],
                };
            }
            if (!this.state.suggestedMetaSets[gName]) {
                newState.suggestedMetaSets = {
                    ...this.state.suggestedMetaSets,
                    [gName]: new Set(["Track type"]),
                };
            }
            if (!this.state.availableTrackSets[gName]) {
                newState.availableTrackSets = {
                    ...this.state.availableTrackSets,
                    [gName]: new Set(),
                };
            }
            if (!this.state.customTracksPool[gName]) {
                newState.customTracksPool = {
                    ...this.state.customTracksPool,
                    [gName]: [],
                };
            }
            if (Object.keys(newState).length) {
                this.setState(newState);
            }
        }
        this.initializeMetaSets(targetProps.tracks);
    }

    initializeMetaSets = (tracks: any[]) => {
        const allKeys = tracks.map((track) => Object.keys(track.metadata));
        const metaKeys = _.union(...allKeys);
        this.addTermToMetaSets(metaKeys);
    };

    addTermToMetaSets(term: any[]) {
        if (!this.getCurrentGenomeName()) return;
        const toBeAdded = Array.isArray(term) ? term : [term];
        this.setState({
            suggestedMetaSets: {
                ...this.state.suggestedMetaSets,
                [this.getCurrentGenomeName()]: new Set([...(this.state.suggestedMetaSets[this.getCurrentGenomeName()] || []), ...toBeAdded]),
            },
        });
    }

    addTracktoAvailable(trackModel: any) {
        if (!this.getCurrentGenomeName()) return;
        this.setState({
            availableTrackSets: {
                ...this.state.availableTrackSets,
                [this.getCurrentGenomeName()]: new Set([...(this.state.availableTrackSets[this.getCurrentGenomeName()] || []), trackModel]),
            },
        });
    }

    removeTrackFromAvailable(trackModel: any) {
        // const newTrackSets = new Set(Array.from(this.state.availableTrackSets));
        const newTrackSets = new Set(Array.from(this.state.availableTrackSets[this.getCurrentGenomeName()]));
        newTrackSets.delete(trackModel);
        this.setState({
            availableTrackSets: {
                ...this.state.availableTrackSets,
                [this.getCurrentGenomeName()]: newTrackSets,
            },
        });
    }

    /**
     * Adds a list of tracks to the list of all tracks available from a public or custom hub.
     *
     * @param {TrackModel[]} newTracks - additions to the list of all tracks available from a hub
     * @param {boolean} toPublic - whether to also add the tracks to public or custom pool
     */
    addTracksToPool(newTracks: TrackModel[], toPublic: boolean = true) {
        const gName = this.getCurrentGenomeName();
        if (toPublic) {
            // const urlSets = new Set([...this.state.publicTrackSets, ...newTracks.map(track => track.url)]);
            this.setState({
                publicTracksPool: { ...this.state.publicTracksPool, [gName]: this.state.publicTracksPool[gName].concat(newTracks) },
                // publicTrackSets: urlSets,
            });
        } else {
            // const urlSets = new Set([...this.state.customTrackSets, ...newTracks.map(track => track.url)]);
            this.setState({
                customTracksPool: { ...this.state.publicTracksPool, [gName]: this.state.customTracksPool[gName].concat(newTracks) },
                // customTrackSets: urlSets,
            });
        }
    }

    updatePublicHubs(publicHubs: any) {
        this.setState({ publicHubs: { ...this.state.publicHubs, [this.getCurrentGenomeName()]: publicHubs } });
    }

    addTracks(tracks: any) {
        const newTracks = this.props.tracks.concat(tracks);
        this.props.onTracksChanged(newTracks);
        this.updateOtherPublicHubs(newTracks);
    }

    removeTrack(indexToRemove: number) {
        const newTracks = this.props.tracks.filter((track, index) => index !== indexToRemove);
        this.props.onTracksChanged(newTracks);
        this.updateOtherPublicHubs(newTracks);
    }

    // toggleNavigator = () => {
    //     this.setState(prevState => {return {isShowingNavigator: !prevState.isShowingNavigator}});
    // };

    // toggle3DScene = () => {
    //     this.setState((prevState) => {
    //         return { isShowing3D: !prevState.isShowing3D };
    //     });
    // };

    // toggleHighlight = () => {
    //     this.setState((prevState) => {
    //         return { highlightEnteredRegion: !prevState.highlightEnteredRegion };
    //     });
    // };

    newHighlight = (start: number, end: number, tag: string = '') => {
        const interval = new HighlightInterval(start, end, tag);
        const existing = this.props.highlights.find(h => h.start === start && h.end === end)
        if (!existing) {
            this.props.onSetHighlights([...this.props.highlights, interval])
        }
    }

    // setHighlightColor = (color: RGBAColor) => {
    //     const rgb = color.rgb;
    //     this.setState({
    //         highlightColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`,
    //     });
    // };

    groupTrackByGenome = () => {
        const { genomeConfig, tracks } = this.props;
        const grouped = {}; // key: genome name like `hg19`, value: a set of track name or url
        tracks.forEach((track) => {
            const gname = track.getMetadata("genome");
            const targeName = gname ? gname : genomeConfig.genome.getName();
            if (grouped[targeName]) {
                grouped[targeName].add(track.url || track.name);
            } else {
                grouped[targeName] = new Set([track.url || track.name]);
            }
        });
        return grouped;
    };

    updateOtherPublicHubs = (tracks: any[]) => {
        const { genomeConfig } = this.props;
        const secondaryGenomes = getSecondaryGenomes(genomeConfig.genome.getName(), tracks);
        const secondConfigs = secondaryGenomes.map((g) => getGenomeConfig(g));
        secondConfigs
            .filter((x) => x.publicHubList)
            .map((x) => x.publicHubList.map((y) => (y.genome = x.genome.getName())));
        let secondHubList = secondConfigs
            .filter((x) => x.publicHubList)
            .reduce((secondHubList, x) => secondHubList.concat(x.publicHubList), []);
        if (genomeConfig.publicHubList) {
            const publicHubs = genomeConfig.publicHubList.slice();
            publicHubs.map((x: { genome: any }) => (x.genome = genomeConfig.genome.getName()));
            secondHubList = publicHubs.concat(secondHubList);
        }
        this.setState({
            publicHubs: { [this.getCurrentGenomeName()]: secondHubList }
        });
    };

    setActiveTool = (tool: typeof Tools.DRAG) => {
        this.setState({
            activeTool: tool
        });
    };

    render() {
        const {
            genomeConfig,
            // viewRegion,
            tracks,
            // onNewViewRegion,
            bundleId,
            sessionFromUrl,
            // trackLegendWidth,
            // onLegendWidthChange,
            isShowingNavigator,
            embeddingMode,
            virusBrowserMode,
            layoutModel,
            onSetAnchors3d,
            onSetGeneFor3d,
            viewer3dNumFrames,
            isThereG3dTrack,
            onSetImageInfo,
            // highlights,
            // onSetHighlights,
            customTracksPool,
            containers,
            // editTarget,
        } = this.props;
        const gName = this.getCurrentGenomeName();
        if (sessionFromUrl) {
            return (
                <div className="container-fluid">
                    <LoadSession bundleId={bundleId} />
                </div>
            );
        }
        const pickingGenome = !(containers && containers.length);
        let tracksUrlSets;
        if (tracks) {
            tracksUrlSets = new Set([
                ...tracks.filter((track) => track.url).map((track) => track.url),
                ...tracks.filter((track) => !track.url).map((track) => track.name),
            ]);
        } else {
            tracksUrlSets = new Set<string>();
        }
        // tracksUrlSets.delete('Ruler'); // allow ruler to be added many times
        // const publicHubs = genomeConfig.publicHubList ? genomeConfig.publicHubList.slice() : [] ;
        let groupedTrackSets, containerTitles: any;
        if (!pickingGenome) {
            groupedTrackSets = this.groupTrackByGenome();
            // navGenomeConfig = containers[0].genomes[0].genomeConfig || getGenomeConfig(containers[0].genomes[0].name);
            containerTitles = containers.map((container) => container.title);
        }
        return (
            <>
                <Nav
                    virusBrowserMode={virusBrowserMode}
                    containerTitles={containerTitles}
                    pickingGenome={pickingGenome}
                    bundleId={bundleId}
                    availableTrackSets={this.state.availableTrackSets[gName]}
                    // addedTrackSets={tracksUrlSets}
                    addTermToMetaSets={this.addTermToMetaSets}
                    addTracktoAvailable={this.addTracktoAvailable}
                    // customTrackSets={this.state.customTrackSets}
                    addedTrackSets={tracksUrlSets}
                    removeTrackFromAvailable={this.removeTrackFromAvailable}
                    onAddTracksToPool={this.addTracksToPool}
                    customTracksPool={customTracksPool}
                    genomeConfig={genomeConfig}
                    onHubUpdated={this.updatePublicHubs}
                    publicHubs={this.state.publicHubs[gName]}
                    onTrackRemoved={this.removeTrack}
                    onTracksAdded={this.addTracks}
                    publicTracksPool={this.state.publicTracksPool[gName]}
                    groupedTrackSets={groupedTrackSets}
                />
                <FloatingTools 
                    activeTool={this.state.activeTool}
                    pickingGenome={pickingGenome}
                    onSetActiveTool={this.setActiveTool}
                />
                {pickingGenome ? (
                    <div>
                        <GenomePickerContainer bundleId={bundleId} />
                        <hr />
                        <Footer />
                        <Notifications />
                    </div>
                ) : (
                    <div className="App container-fluid">
                        <Notifications />
                        <Offline>
                            <div className="alert alert-warning text-center lead" role="alert">
                                You are currently offline, so tracks on web won't load. But you can still use the{" "}
                                <a href={HELP_LINKS.localhub} target="_blank" rel="noopener noreferrer">
                                    Local Track
                                </a>{" "}
                                and{" "}
                                <a href={HELP_LINKS.textTrack} target="_blank" rel="noopener noreferrer">
                                    Local Text Track
                                </a>{" "}
                                functions.
                            </div>
                        </Offline>
                        {/* Implement such that when there's a genome name but no containers, just render like we would before phased update. */}
                        <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            {containers.map((data: SyncedContainer, idx: number) => {
                                return (
                                    <div
                                        key={idx}
                                        style={{
                                            marginTop: 20,
                                            marginBottom: idx === containers.length - 1 ? 0 : 20,
                                        }}
                                    >
                                        <ContainerView
                                            stateIdx={idx}
                                            key={idx}
                                            cdata={data}

                                            layoutModel={layoutModel}
                                            onSetAnchors3d={onSetAnchors3d}
                                            onSetGeneFor3d={onSetGeneFor3d}
                                            viewer3dNumFrames={viewer3dNumFrames}
                                            isThereG3dTrack={isThereG3dTrack}
                                            onSetImageInfo={onSetImageInfo}
                                            isShowingNavigator={isShowingNavigator}
                                            containerTitles={containerTitles}

                                            embeddingMode={embeddingMode}
                                            virusBrowserMode={virusBrowserMode}
                                            activeTool={this.state.activeTool} 

                                            highlightColor={this.state.highlightColor}
                                            highlightEnteredRegion={this.state.highlightEnteredRegion}
                                        />
                                    </div>
                                )
                            })}
                        </motion.div>
                        {!embeddingMode && <Footer />}
                    </div>
                )}
            </>
        );
    }
}

export default withEnhancements(App);

// @ts-ignore
export const AppWithoutGenome = withAppState(App);
