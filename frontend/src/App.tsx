import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import _ from "lodash";
// import AppState, { ActionCreators } from "./AppState";
import { GlobalActionCreators, GenomeState, SyncedContainer } from "./AppState";
import GenomePickerContainer from "./components/GenomePicker";
import Nav from "./components/Nav";
import GenomeNavigator from "./components/genomeNavigator/GenomeNavigator";
import ContainerView from "./components/containerView/ContainerView";
import TrackContainer from "./components/trackContainers/TrackContainer";
import withCurrentGenome from "./components/withCurrentGenome";
import DisplayedRegionModel from "./model/DisplayedRegionModel";
import TrackModel from "./model/TrackModel";
import Notifications from "react-notify-toast";
import LoadSession from "./components/LoadSession";
import { RegionExpander } from "./model/RegionExpander";
import { Footer } from "./components/Footer";
import { Offline } from "react-detect-offline";
import { HELP_LINKS, getSecondaryGenomes } from "./util";
import { getGenomeConfig } from "./model/genomes/allGenomes";
import { HighlightInterval } from './components/trackContainers/HighlightMenu';

import "./App.css";

const REGION_EXPANDER = new RegionExpander(1);

interface MapStateToPropsProps {
    browser: {
        present: {
            viewRegion: DisplayedRegionModel;
            tracks: TrackModel[];
            bundleId: string;
            sessionFromUrl: string;
            trackLegendWidth: number;
            isShowingNavigator: boolean;
            customTracksPool: TrackModel[];
            virusBrowserMode: boolean;
            highlights: HighlightInterval[];

            containers: SyncedContainer[];
        }
    }
}

function mapStateToProps(state: MapStateToPropsProps) {
    return {
        viewRegion: state.browser.present.viewRegion,
        tracks: state.browser.present.tracks,
        bundleId: state.browser.present.bundleId,
        sessionFromUrl: state.browser.present.sessionFromUrl,
        trackLegendWidth: state.browser.present.trackLegendWidth,
        isShowingNavigator: state.browser.present.isShowingNavigator,
        customTracksPool: state.browser.present.customTracksPool,
        virusBrowserMode: state.browser.present.virusBrowserMode,
        highlights: state.browser.present.highlights,

        containers: state.browser.present.containers,
    };
}

const callbacks = {
    onNewViewRegion: GlobalActionCreators.setViewRegion,
    onTracksChanged: GlobalActionCreators.setTracks,
    onLegendWidthChange: GlobalActionCreators.setTrackLegendWidth,
    onSetHighlights: GlobalActionCreators.setHighlights,
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

            containers,
        } = this.props;

        if (sessionFromUrl) {
            return (
                <div className="container-fluid">
                    <LoadSession bundleId={bundleId} />
                </div>
            );
        }
        if (!(containers && containers.length)) {
            return (
                <div>
                    <GenomePickerContainer bundleId={bundleId} />
                    <hr />
                    <Footer />
                    <Notifications />
                </div>
            );
        }
        const tracksUrlSets = new Set([
            ...tracks.filter((track) => track.url).map((track) => track.url),
            ...tracks.filter((track) => !track.url).map((track) => track.name),
        ]);
        // tracksUrlSets.delete('Ruler'); // allow ruler to be added many times
        // const publicHubs = genomeConfig.publicHubList ? genomeConfig.publicHubList.slice() : [] ;
        const groupedTrackSets = this.groupTrackByGenome();
        const navGenomeConfig = containers[0].genomes[0].genomeConfig || getGenomeConfig(containers[0].genomes[0].name);
        const containerTitles = containers.map((container) => container.title);
        return (
            <div className="App container-fluid">
                <Nav
                    {...this.state}
                    // isShowingNavigator={isShowingNavigator}
                    // onToggleNavigator={onToggleNavigator}
                    // onToggle3DScene={this.toggle3DScene}
                    // onToggleHighlight={this.toggleHighlight}
                    onNewHighlight={this.newHighlight}
                    // onSetHighlightColor={this.setHighlightColor}
                    selectedRegion={viewRegion}
                    onRegionSelected={onNewViewRegion}
                    tracks={tracks}
                    genomeConfig={navGenomeConfig}
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
                    highlights={highlights}
                />
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
                        <div style={{
                            marginTop: 20,
                            marginBottom: idx === containers.length - 1 ? 0 : 20,
                        }}>
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
        );
    }
}

export default withEnhancements(App);

// @ts-ignore
export const AppWithoutGenome = withAppState(App);
