import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import _ from "lodash";
import { ActionCreators } from "./AppState";
import GenomePicker from "./components/GenomePicker";
import Nav from "./components/Nav";
import GenomeNavigator from "./components/genomeNavigator/GenomeNavigator";
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

import "./App.css";
import ChromosomeInterval from "model/interval/ChromosomeInterval";
import OpenInterval from "model/interval/OpenInterval";

const REGION_EXPANDER = new RegionExpander(1);

function mapStateToProps(state) {
    return {
        viewRegion: state.browser.present.viewRegion,
        tracks: state.browser.present.tracks,
        bundleId: state.browser.present.bundleId,
        sessionFromUrl: state.browser.present.sessionFromUrl,
        trackLegendWidth: state.browser.present.trackLegendWidth,
        isShowingNavigator: state.browser.present.isShowingNavigator,
        customTracksPool: state.browser.present.customTracksPool,
        virusBrowserMode: state.browser.present.virusBrowserMode,
    };
}

const callbacks = {
    onNewViewRegion: ActionCreators.setViewRegion,
    onTracksChanged: ActionCreators.setTracks,
    onLegendWidthChange: ActionCreators.setTrackLegendWidth,
};

const withAppState = connect(mapStateToProps, callbacks);
const withEnhancements = _.flowRight(withAppState, withCurrentGenome);

class App extends React.PureComponent {
    static propTypes = {
        genomeConfig: PropTypes.object,
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel),
        tracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)),
        onNewViewRegion: PropTypes.func,
        onTracksChanged: PropTypes.func,
        embeddingMode: PropTypes.bool,
    };

    constructor(props) {
        super(props);
        this.state = {
            // isShowing3D: false,
            // isShowingNavigator: true,
            highlightEnteredRegion: true,
            enteredRegion: null,
            highlightColor: "rgba(255, 255, 0, 0.3)", // light yellow
            publicHubs: [],
            publicTracksPool: [],
            customTracksPool: [],
            // publicTrackSets: new Set(),
            // customTrackSets: new Set(),
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
        this.setEnteredRegion = this.setEnteredRegion.bind(this);
        this.convertEnteredRegionToChromosomeInterval = this.convertEnteredRegionToChromosomeInterval.bind(this);
    }

    componentDidMount() {
        if (this.props.genomeConfig) {
            this.updateOtherPublicHubs(this.props.tracks);
        }
        this.initializeMetaSets(this.props.tracks);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.genomeConfig && nextProps.genomeConfig !== this.props.genomeConfig) {
            if (nextProps.genomeConfig.publicHubList) {
                const publicHubs = nextProps.genomeConfig.publicHubList.slice();
                publicHubs.map((x) => (x.genome = nextProps.genomeConfig.genome.getName()));
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

    initializeMetaSets = (tracks) => {
        const allKeys = tracks.map((track) => Object.keys(track.metadata));
        const metaKeys = _.union(...allKeys);
        this.addTermToMetaSets(metaKeys);
    };

    addTermToMetaSets(term) {
        const toBeAdded = Array.isArray(term) ? term : [term];
        this.setState({
            suggestedMetaSets: new Set([...this.state.suggestedMetaSets, ...toBeAdded]),
        });
    }

    addTracktoAvailable(trackModel) {
        this.setState({
            availableTrackSets: new Set([...this.state.availableTrackSets, trackModel]),
        });
    }

    removeTrackFromAvailable(trackModel) {
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
    addTracksToPool(newTracks, toPublic = true) {
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

    updatePublicHubs(publicHubs) {
        this.setState({ publicHubs });
    }

    addTracks(tracks) {
        const newTracks = this.props.tracks.concat(tracks);
        this.props.onTracksChanged(newTracks);
        this.updateOtherPublicHubs(newTracks);
    }

    removeTrack(indexToRemove) {
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

    toggleHighlight = () => {
        this.setState((prevState) => {
            return { highlightEnteredRegion: !prevState.highlightEnteredRegion };
        });
    };

    setEnteredRegion = (chrInterval) => {
        this.setState({ enteredRegion: chrInterval });
        console.log(chrInterval);
    };

    /**
     * Converts OpenInterval start/stop into ChromosomeInterval based on _navContext
     * @param {number} start absolute start of enteredRegion
     * @param {number} stop absolute end of enteredRegion
     * 
     * FIXME strategy 1: gets viewRegion as string, then splits string to get chrNumber, start, and end
     * FIXME strategy 2: modify the DisplayRegionModel.currentRegionAsString() to take custom start/end
     *  that are within the viewRegion
     */
    convertEnteredRegionToChromosomeInterval = (start, end) => {
        // Method 1:
        this.setEnteredRegion(new OpenInterval(start, end));

        // Method 2:
        // const segments = viewRegion.getFeatureSegments();
        // const coords = this.props.viewRegion.customRegionAsString(start, end);
        // const chr = coords.split(':')[0];
        // const chrStart = coords.split(':')[1].split('-')[0];
        // const chrEnd = coords.split(':')[1].split('-')[1];
        // this.setEnteredRegion(new ChromosomeInterval(chr, Number(chrStart), Number(chrEnd)));
    }

    setHighlightColor = (color) => {
        const rgb = color.rgb;
        this.setState({
            highlightColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`,
        });
    };

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

    updateOtherPublicHubs = (tracks) => {
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
            publicHubs.map((x) => (x.genome = genomeConfig.genome.getName()));
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
        } = this.props;
        if (sessionFromUrl) {
            return (
                <div className="container-fluid">
                    <LoadSession bundleId={bundleId} />
                </div>
            );
        }
        if (!genomeConfig) {
            return (
                <div>
                    <GenomePicker bundleId={bundleId} />
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
        return (
            <div className="App container-fluid">
                <Nav
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
                />
                <Notifications />
                {isShowingNavigator && (
                    <GenomeNavigator selectedRegion={viewRegion} onRegionSelected={onNewViewRegion} />
                )}
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
                <TrackContainer
                    enteredRegion={this.state.enteredRegion}
                    highlightColor={this.state.highlightColor}
                    highlightEnteredRegion={this.state.highlightEnteredRegion}
                    expansionAmount={REGION_EXPANDER}
                    suggestedMetaSets={this.state.suggestedMetaSets}
                    genomeConfig={genomeConfig}
                    tracks={tracks.filter((tk) => tk.type !== "g3d")}
                    layoutModel={layoutModel}
                    onSetAnchors3d={onSetAnchors3d}
                    onSetGeneFor3d={onSetGeneFor3d}
                    viewer3dNumFrames={viewer3dNumFrames}
                    isThereG3dTrack={isThereG3dTrack}
                    onSetImageInfo={onSetImageInfo}
                    setEnteredRegion={this.setEnteredRegion}
                    setNewEnteredRegion={this.convertEnteredRegionToChromosomeInterval}
                />
                {!embeddingMode && <Footer />}
            </div>
        );
    }
}

export default withEnhancements(App);

export const AppWithoutGenome = withAppState(App);
