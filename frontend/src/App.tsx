import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import _ from "lodash";
import Notifications from "react-notify-toast";
import { Offline } from "react-detect-offline";
// import AppState, { ActionCreators } from "./AppState";
import AppState, { ActionCreators, GenomeState, SyncedContainer } from "./AppState";
import GenomePickerContainer from "./components/GenomePicker";
import Nav from "./components/nav/Nav";
import GenomeNavigator from "./components/genomeNavigator/GenomeNavigator";
import ContainerView from "./components/containerView/ContainerView";
import TrackContainer from "./components/trackContainers/TrackContainer";
import withCurrentGenome from "./components/withCurrentGenome";
import DisplayedRegionModel from "./model/DisplayedRegionModel";
import TrackModel from "./model/TrackModel";
import LoadSession from "./components/LoadSession";
import { RegionExpander } from "./model/RegionExpander";
import { Footer } from "./components/Footer";
import { getGenomeConfig } from "./model/genomes/allGenomes";
import { HighlightInterval } from './components/trackContainers/HighlightMenu';
import { HELP_LINKS, getSecondaryGenomes } from "./util";

import "./App.css";

const REGION_EXPANDER = new RegionExpander(1);

function mapStateToProps(state: { browser: { present: AppState } }) {
    const appState = state.browser.present;
    const [cidx, gidx] = appState.editTarget;
    const { compatabilityMode, containers } = appState;
    const pickingGenome = !(containers && containers.length);

    let editingGenome = {} as GenomeState, editingContainer = {} as SyncedContainer;
    if (!pickingGenome && !compatabilityMode) {
        editingGenome = (appState.containers && appState.containers[cidx].genomes[gidx]) || {} as GenomeState;
        editingContainer = (appState.containers && appState.containers[cidx]) || {} as SyncedContainer;
    }

    return {
        viewRegion: editingContainer.viewRegion || appState.viewRegion,
        tracks: editingGenome.tracks || appState.tracks,
        bundleId: appState.bundleId,
        sessionFromUrl: appState.sessionFromUrl,
        trackLegendWidth: appState.trackLegendWidth,
        isShowingNavigator: appState.isShowingNavigator,
        customTracksPool: editingGenome.customTracksPool || appState.customTracksPool,
        virusBrowserMode: appState.virusBrowserMode,
        highlights: editingGenome.highlights || appState.highlights,

        containers: appState.containers,
        editTarget: appState.editTarget,
    };
}

const callbacks = {
    onNewViewRegion: ActionCreators.setViewRegion,
    onTracksChanged: ActionCreators.setTracks,
    onLegendWidthChange: ActionCreators.setTrackLegendWidth,
    onSetHighlights: ActionCreators.setHighlights,
};

const withAppState = connect(mapStateToProps, callbacks);
const withEnhancements = _.flowRight(withAppState, withCurrentGenome);

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
    publicHubs: any[];
    publicTracksPool: any[];
    customTracksPool: any[];
    availableTrackSets: Set<string>;
    suggestedMetaSets: Set<string>;
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
            publicHubs: [],
            publicTracksPool: [],
            customTracksPool: [],
            availableTrackSets: new Set(),
            suggestedMetaSets: new Set(["Track type"]),
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
    }

    componentDidUpdate(prevProps: Readonly<AppProps>): void {
        if (prevProps.editTarget[0] !== this.props.editTarget[0] || prevProps.editTarget[1] !== this.props.editTarget[1]) {
            // if does not exist do not update
            if (this.props.containers && this.props.containers[this.props.editTarget[0]] && this.props.containers[this.props.editTarget[0]].genomes[this.props.editTarget[1]]) {
                this.updateOtherPublicHubs(this.props.containers[this.props.editTarget[0]].genomes[this.props.editTarget[1]].tracks);
            }
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps: AppProps) {
        if (nextProps.genomeConfig && nextProps.genomeConfig !== this.props.genomeConfig) {
            if (nextProps.genomeConfig.publicHubList) {
                const publicHubs = nextProps.genomeConfig.publicHubList.slice();
                publicHubs.map((x: { genome: any }) => (x.genome = nextProps.genomeConfig.genome.getName()));
                this.setState({
                    publicHubs: publicHubs,
                });
            } else {
                // when switch genome, need reset hub as well
                this.setState({
                    publicHubs: [],
                });
            }
            this.setState({ publicTracksPool: [], customTracksPool: [] });
        }
        if (nextProps.publicTracksPool !== this.props.publicTracksPool) {
            if (nextProps.publicTracksPool) {
                this.setState({ publicTracksPool: nextProps.publicTracksPool });
            } else {
                this.setState({ publicTracksPool: [] });
            }
        }
        if (nextProps.customTracksPool !== this.props.customTracksPool) {
            if (nextProps.customTracksPool) {
                this.setState({ customTracksPool: nextProps.customTracksPool });
            } else {
                this.setState({ customTracksPool: [] });
            }
        }
        this.initializeMetaSets(nextProps.tracks);
    }

    initializeMetaSets = (tracks: any[]) => {
        const allKeys = tracks.map((track) => Object.keys(track.metadata));
        const metaKeys = _.union(...allKeys);
        this.addTermToMetaSets(metaKeys);
    };

    addTermToMetaSets(term: any[]) {
        const toBeAdded = Array.isArray(term) ? term : [term];
        this.setState({
            suggestedMetaSets: new Set([...this.state.suggestedMetaSets, ...toBeAdded]),
        });
    }

    addTracktoAvailable(trackModel: any) {
        this.setState({
            availableTrackSets: new Set([...this.state.availableTrackSets, trackModel]),
        });
    }

    removeTrackFromAvailable(trackModel: any) {
        const newTrackSets = new Set(Array.from(this.state.availableTrackSets));
        newTrackSets.delete(trackModel);
        this.setState({
            availableTrackSets: newTrackSets,
        });
    }

    /**
     * Adds a list of tracks to the list of all tracks available from a public or custom hub.
     *
     * @param {TrackModel[]} newTracks - additions to the list of all tracks available from a hub
     * @param {boolean} toPublic - whether to also add the tracks to public or custom pool
     */
    addTracksToPool(newTracks: TrackModel[], toPublic: boolean = true) {
        if (toPublic) {
            // const urlSets = new Set([...this.state.publicTrackSets, ...newTracks.map(track => track.url)]);
            this.setState({
                publicTracksPool: this.state.publicTracksPool.concat(newTracks),
                // publicTrackSets: urlSets,
            });
        } else {
            // const urlSets = new Set([...this.state.customTrackSets, ...newTracks.map(track => track.url)]);
            this.setState({
                customTracksPool: this.state.customTracksPool.concat(newTracks),
                // customTrackSets: urlSets,
            });
        }
    }

    updatePublicHubs(publicHubs: any) {
        this.setState({ publicHubs });
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
            publicHubs: secondHubList,
        });
    };

    render() {
        const {
            genomeConfig,
            viewRegion,
            tracks,
            onNewViewRegion,
            bundleId,
            sessionFromUrl,
            trackLegendWidth,
            onLegendWidthChange,
            isShowingNavigator,
            embeddingMode,
            virusBrowserMode,
            layoutModel,
            onSetAnchors3d,
            onSetGeneFor3d,
            viewer3dNumFrames,
            isThereG3dTrack,
            onSetImageInfo,
            highlights,
            onSetHighlights,
            customTracksPool,
            containers,
            editTarget,
        } = this.props;

        if (sessionFromUrl) {
            return (
                <div className="container-fluid">
                    <LoadSession bundleId={bundleId} />
                </div>
            );
        }
        const pickingGenome = !(containers && containers.length);
        const tracksUrlSets = new Set([
            ...tracks.filter((track) => track.url).map((track) => track.url),
            ...tracks.filter((track) => !track.url).map((track) => track.name),
        ]);
        // tracksUrlSets.delete('Ruler'); // allow ruler to be added many times
        // const publicHubs = genomeConfig.publicHubList ? genomeConfig.publicHubList.slice() : [] ;
        let groupedTrackSets, navGenomeConfig, containerTitles: any;
        if (!pickingGenome) {
            groupedTrackSets = this.groupTrackByGenome();
            navGenomeConfig = containers[0].genomes[0].genomeConfig || getGenomeConfig(containers[0].genomes[0].name);
            containerTitles = containers.map((container) => container.title);
        }
        return (
            <>
                {/* <Nav
                    {...this.state}
                    // isShowingNavigator={isShowingNavigator}
                    // onToggleNavigator={onToggleNavigator}
                    // onToggle3DScene={this.toggle3DScene}
                    onToggleHighlight={this.toggleHighlight}
                    onSetEnteredRegion={this.setEnteredRegion}
                    onSetHighlightColor={this.setHighlightColor}
                    selectedRegion={viewRegion}
                    onRegionSelected={onNewViewRegion}
                    tracks={tracks}
                    genomeConfig={genomeConfig}
                    onTracksAdded={this.addTracks}
                    onTrackRemoved={this.removeTrack}
                    bundleId={bundleId}
                    trackLegendWidth={trackLegendWidth}
                    onLegendWidthChange={onLegendWidthChange}
                    onAddTracksToPool={this.addTracksToPool}
                    onHubUpdated={this.updatePublicHubs}
                    addedTrackSets={tracksUrlSets}
                    // publicHubs={publicHubs}
                    removeTrackFromAvailable={this.removeTrackFromAvailable}
                    addTracktoAvailable={this.addTracktoAvailable}
                    addTermToMetaSets={this.addTermToMetaSets}
                    embeddingMode={embeddingMode}
                    groupedTrackSets={groupedTrackSets}
                    virusBrowserMode={virusBrowserMode}
                /> */}
                <Nav
                    virusBrowserMode={virusBrowserMode}
                    containerTitles={containerTitles}
                    pickingGenome={pickingGenome}
                    bundleId={bundleId}
                    availableTrackSets={this.state.availableTrackSets}
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
                    publicHubs={this.state.publicHubs}
                    onTrackRemoved={this.removeTrack}
                    onTracksAdded={this.addTracks}
                    publicTracksPool={this.state.publicTracksPool}
                    groupedTrackSets={groupedTrackSets}
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
                                    />
                                </div>
                            )
                        })}
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
