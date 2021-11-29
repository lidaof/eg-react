import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import connect from "react-redux/lib/connect/connect";
import ReactModal from "react-modal";
import Hotkeys from "react-hot-keys";
import { ActionCreators } from "../../AppState";
import { withTrackData } from "./TrackDataManager";
import { withTrackView } from "./TrackViewManager";
import TrackHandle from "./TrackHandle";
import { PannableTrackContainer } from "./PannableTrackContainer";
import ReorderableTrackContainer from "./ReorderableTrackContainer";
import { ZoomableTrackContainer } from "./ZoomableTrackContainer";
import HighlightableTrackContainer from "./HighlightableTrackContainer";
import HighlightNewRegion from "./HighlightNewRegion";
import MetadataHeader from "./MetadataHeader";
import { Tools, ToolButtons } from "./Tools";
import ZoomButtons from "./ZoomButtons";
import OutsideClickDetector from "../OutsideClickDetector";
import ContextMenuManager from "../ContextMenuManager";
import DivWithBullseye from "../DivWithBullseye";
import withAutoDimensions from "../withAutoDimensions";
import TrackContextMenu from "../trackContextMenu/TrackContextMenu";
import TrackModel from "../../model/TrackModel";
import TrackSelectionBehavior from "../../model/TrackSelectionBehavior";
import DisplayedRegionModel from "../../model/DisplayedRegionModel";
import UndoRedo from "./UndoRedo";
import History from "./History";
import HighlightRegion from "../HighlightRegion";
import HighlightMenu from "./HighlightMenu";
import { VerticalDivider } from "./VerticalDivider";
import { CircletView } from "./CircletView";
import ButtonGroup from "./ButtonGroup";
import TrackRegionController from "../genomeNavigator/TrackRegionController";
import ReorderMany from "./ReorderMany";
import { niceBpCount } from "../../util";

import "./TrackContainer.css";
import { GroupedTrackManager } from "components/trackManagers/GroupedTrackManager";
import { getTrackConfig } from "components/trackConfig/getTrackConfig";

// import { DEFAULT_OPTIONS as DYNAMIC_OPTIONS } from "components/trackVis/commonComponents/numerical/DynamicplotTrack";

const DEFAULT_CURSOR = "crosshair";
const SELECTION_BEHAVIOR = new TrackSelectionBehavior();

///////////
// HOC's //
///////////
function mapStateToProps(state) {
    return {
        genome: state.browser.present.genomeName,
        viewRegion: state.browser.present.viewRegion,
        // tracks: state.browser.present.tracks,
        metadataTerms: state.browser.present.metadataTerms,
    };
}

const callbacks = {
    onNewRegion: ActionCreators.setViewRegion,
    onTracksChanged: ActionCreators.setTracks,
    onMetadataTermsChanged: ActionCreators.setMetadataTerms,
};

const withAppState = connect(mapStateToProps, callbacks);
const withEnhancements = _.flowRight(withAppState, withAutoDimensions, withTrackView, withTrackData);

/**
 * Container for holding all the tracks, and an avenue for manipulating state common to all tracks.
 *
 * @author Silas Hsu
 */
class TrackContainer extends React.Component {
    static propTypes = {
        tracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)).isRequired, // Tracks to render
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
        primaryView: PropTypes.object,
        trackData: PropTypes.object.isRequired,
        metadataTerms: PropTypes.arrayOf(PropTypes.string).isRequired, // Metadata terms
        /**
         * Callback for when a new region is selected.  Signature:
         *     (newStart: number, newEnd: number): void
         *         `newStart`: the nav context coordinate of the start of the new view interval
         *         `newEnd`: the nav context coordinate of the end of the new view interval
         */
        onNewRegion: PropTypes.func,
        /**
         * Callback requesting a change in the track models.  Signature: (newModels: TrackModel[]): void
         */
        onTracksChanged: PropTypes.func,
        /**
         * Callback requesting a change in the metadata terms.  Signature: (newTerms: string[]): void
         */
        onMetadataTermsChanged: PropTypes.func,
        suggestedMetaSets: PropTypes.instanceOf(Set),
    };

    static defaultProps = {
        tracks: [],
        onNewRegion: () => undefined,
        onTracksChanged: () => undefined,
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedTool: Tools.DRAG,
            xOffset: 0,
            showModal: false,
            showReorderManyModal: false,
            trackForCircletView: null, // the trackmodel for circlet view
            circletColor: "#ff5722",
            panningAnimation: "none",
            zoomAnimation: 0,
            groupScale: undefined,
            showHighlightMenu: false,
        };
        this.leftBeam = React.createRef();
        this.rightBeam = React.createRef();

        this.toggleTool = this.toggleTool.bind(this);
        this.handleTrackClicked = this.handleTrackClicked.bind(this);
        this.handleMetadataClicked = this.handleMetadataClicked.bind(this);
        this.handleContextMenu = this.handleContextMenu.bind(this);
        this.deselectAllTracks = this.deselectAllTracks.bind(this);
        this.changeXOffset = this.changeXOffset.bind(this);
        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.renderModal = this.renderModal.bind(this);
        this.setCircletColor = this.setCircletColor.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.panLeftOrRight = this.panLeftOrRight.bind(this);
        this.zoomOut = this.zoomOut.bind(this);
        this.groupManager = new GroupedTrackManager();

        // this.onClick = (evt) => {
        //     console.log(evt);
        //     this.initializeHighlight(evt);
        // }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.tracks !== this.props.tracks || prevProps.primaryView !== this.props.primaryView) {
            this.getGroupScale();
        }
    }

    getBeamRefs = () => {
        return [this.leftBeam.current, this.rightBeam.current];
    };

    panLeftOrRight(left = true) {
        const { primaryView, onNewRegion } = this.props;
        let newRegion, panning;
        if (left) {
            panning = "left";
            newRegion = primaryView.viewWindowRegion.clone().panLeft();
        } else {
            panning = "right";
            newRegion = primaryView.viewWindowRegion.clone().panRight();
        }
        this.setState({ panningAnimation: panning }, () => {
            window.setTimeout(() => {
                this.setState({ panningAnimation: "none" });
                // this.pan(-width); // Changes DRM
                onNewRegion(...newRegion.getContextCoordinates());
            }, 1000);
        });
        // onNewRegion(...newRegion.getContextCoordinates());
    }

    zoomOut(factor) {
        const { primaryView, onNewRegion } = this.props;
        const newRegion = primaryView.viewWindowRegion.clone().zoom(factor);
        this.setState({ zoomAnimation: factor }, () => {
            window.setTimeout(() => {
                this.setState({ zoomAnimation: 0 });
                onNewRegion(...newRegion.getContextCoordinates());
            }, 1000);
        });
        // onNewRegion(...newRegion.getContextCoordinates());
    }

    onKeyDown(keyName, e, handle) {
        switch (keyName) {
            case "alt+h":
            case "alt+d":
                this.toggleTool(Tools.DRAG);
                break;
            case "alt+s":
            case "alt+r":
                this.toggleTool(Tools.REORDER);
                break;
            case "alt+m":
                this.toggleTool(Tools.ZOOM_IN);
                break;
            case "alt+z":
                this.panLeftOrRight(true);
                break;
            case "alt+x":
                this.panLeftOrRight(false);
                break;
            case "alt+i":
                this.zoomOut(0.5);
                break;
            case "alt+o":
                this.zoomOut(2);
                break;
            case "alt+g":
                this.toggleReorderManyModal();
                break;
            default:
                break;
        }
    }
    /**
     * Toggles the selection of a tool, or switches tool.
     *
     * @param {Tool} tool - tool to toggle or to switch to
     */
    toggleTool(tool) {
        if (this.state.selectedTool === tool) {
            this.setState({ selectedTool: null });
        } else {
            this.setState({ selectedTool: tool });
        }
    }

    changeXOffset(xOffset) {
        this.setState({ xOffset });
    }

    handleOpenModal(track) {
        this.setState({ showModal: true, trackForCircletView: track });
    }

    handleCloseModal() {
        this.setState({ showModal: false, trackForCircletView: null });
    }

    setCircletColor(color) {
        this.setState({ circletColor: color });
    }

    openReorderManyModal = () => {
        this.setState({ showReorderManyModal: true });
    };

    closeReorderManyModal = () => {
        this.setState({ showReorderManyModal: false });
    };

    toggleReorderManyModal = () => {
        this.setState((prevState) => {
            return { showReorderManyModal: !prevState.showReorderManyModal };
        });
    };

    openHighlightMenu = () => {
        this.setState({ showHighlightMenu: true });
    };

    closeHighlightMenu = () => {
        this.setState({ showHighlightMenu: false });
    };

    toggleHighlightMenu = () => {
        this.setState((prevState) => {
            return { showHighlightMenu: !prevState.showHighlightMenu };
        });
    };

    /**
     *
     * @param {boolean[]} newSelections
     */
    changeTrackSelection(newSelections) {
        if (!newSelections) {
            return;
        }
        const tracks = this.props.tracks;
        if (tracks.length !== newSelections.length) {
            console.error("Cannot apply track selection array with different length than existing tracks.");
            console.error(newSelections);
        }

        let wasTrackChanged = false;
        const nextTracks = tracks.map((track, i) => {
            if (track.isSelected !== newSelections[i]) {
                const clone = track.clone();
                clone.isSelected = newSelections[i];
                wasTrackChanged = true;
                return clone;
            } else {
                return track;
            }
        });

        if (wasTrackChanged) {
            this.props.onTracksChanged(nextTracks);
        }
    }

    /**
     * Handles selection behavior when a track is clicked.
     *
     * @param {MouseEvent} event - click event
     * @param {number} index - index of the clicked track
     */
    handleTrackClicked(event, index) {
        this.changeTrackSelection(SELECTION_BEHAVIOR.handleClick(this.props.tracks, index, event));
    }

    /**
     * Handles selection behavior when a track's context menu is opened.
     *
     * @param {MouseEvent} event - context menu event.  Unused.
     * @param {number} index - index of the track where the context menu event originated
     */
    handleContextMenu(event, index) {
        this.changeTrackSelection(SELECTION_BEHAVIOR.handleContextMenu(this.props.tracks, index));
    }

    /**
     * Handles selection behavior when a track's metadata indicator is clicked.
     *
     * @param {MouseEvent} event - click event
     * @param {string} term - the metadata term that was clicked
     * @param {number} index - index of the clicked track
     */
    handleMetadataClicked(event, term, index) {
        this.changeTrackSelection(SELECTION_BEHAVIOR.handleMetadataClick(this.props.tracks, index, term, event));
    }

    /**
     * Requests deselection of all tracks.
     */
    deselectAllTracks() {
        this.changeTrackSelection(Array(this.props.tracks.length).fill(false));
    }

    /**
     * happens when user selects matplot
     */
    applyMatPlot = (tracks) => {
        // console.log(tracks);
        // const tracksLeft = this.props.tracks.filter(tk => !tk.isSelected);
        const newTrack = new TrackModel({
            type: "matplot",
            name: "matplot wrap",
            tracks,
        });
        // const newTracks = [...tracksLeft, newTrack];
        const newTracks = [...this.props.tracks, newTrack];
        this.props.onTracksChanged(newTracks);
    };

    /**
     * happens when user selects dynamic plot
     */
    applyDynamicPlot = (tracks) => {
        // const colors = [];
        // tracks.forEach(tk => {
        //     if (tk.options && tk.options.color) {
        //         colors.push(tk.options.color);
        //     }
        // });
        const labels = tracks.map((t) => t.label);
        const colors = [];
        let useDynamicColors = false;
        tracks.forEach((t) => {
            if (t.options.color) {
                colors.push(t.options.color);
            }
        });
        if (colors.length === tracks.length) {
            useDynamicColors = true;
        }
        const newTrack = new TrackModel({
            type: "dynamic",
            name: "dynamic plot",
            tracks,
            options: {
                steps: tracks.length,
                //...DYNAMIC_OPTIONS,
                // colors
                dynamicLabels: labels,
                dynamicColors: colors,
                useDynamicColors,
            },
        });
        const newTracks = [...this.props.tracks, newTrack];
        this.props.onTracksChanged(newTracks);
    };

    /**
     * happens when user selects dynamic hic plot
     */
    applyDynamicHic = (tracks) => {
        const colors = [];
        let useDynamicColors = false;
        tracks.forEach((t) => {
            if (t.options.color) {
                colors.push(t.options.color);
            }
        });
        if (colors.length === tracks.length) {
            useDynamicColors = true;
        }
        const newTrack = new TrackModel({
            type: "dynamichic",
            name: "dynamic hic",
            tracks,
            options: {
                dynamicColors: colors,
                useDynamicColors,
            },
        });
        const newTracks = [...this.props.tracks, newTrack];
        this.props.onTracksChanged(newTracks);
    };

    /**
     * happens when user selects dynamic hic plot
     */
    applyDynamicLongrange = (tracks) => {
        const colors = [];
        let useDynamicColors = false;
        tracks.forEach((t) => {
            if (t.options.color) {
                colors.push(t.options.color);
            }
        });
        if (colors.length === tracks.length) {
            useDynamicColors = true;
        }
        const newTrack = new TrackModel({
            type: "dynamiclongrange",
            name: "dynamic longrange",
            tracks,
            options: {
                dynamicColors: colors,
                useDynamicColors,
            },
        });
        const newTracks = [...this.props.tracks, newTrack];
        this.props.onTracksChanged(newTracks);
    };

    /**
     * happens when user selects dynamic bed
     */
    applyDynamicBed = (tracks) => {
        const colors = [];
        let useDynamicColors = false;
        tracks.forEach((t) => {
            if (t.options.color) {
                colors.push(t.options.color);
            }
        });
        if (colors.length === tracks.length) {
            useDynamicColors = true;
        }
        const newTrack = new TrackModel({
            type: "dynamicbed",
            name: "dynamic bed",
            tracks,
            options: {
                dynamicColors: colors,
                useDynamicColors,
            },
        });
        const newTracks = [...this.props.tracks, newTrack];
        this.props.onTracksChanged(newTracks);
    };

    /**
     * starts highlight
     * @param {MouseEvent} evt
     */
    // initializeHighlight(evt) {
    //     console.log(evt)
    // }

    // End callback methods
    ////////////////////
    // Render methods //
    ////////////////////
    /**
     * @return {JSX.Element}
     */
    renderControls() {
        const {
            metadataTerms,
            onMetadataTermsChanged,
            suggestedMetaSets,
            viewRegion,
            onNewRegion,
            onToggleHighlight,
            onSetEnteredRegion,
            primaryView,
        } = this.props;
        // console.log(this.props, viewRegion);
        // position: "-webkit-sticky", position: "sticky", top: 0, zIndex: 1, background: "white"
        const panLeftButton = (
            <button
                className="btn btn-outline-dark"
                title="Pan left
(Alt+Z)"
                style={{ fontFamily: "monospace" }}
                onClick={() => this.panLeftOrRight(true)}
            >
                ◀
            </button>
        );
        const panRightButton = (
            <button
                className="btn btn-outline-dark"
                title="Pan right
(Alt+X)"
                style={{ fontFamily: "monospace" }}
                onClick={() => this.panLeftOrRight(false)}
            >
                ▶
            </button>
        );
        return (
            <div className="tool-container">
                <div className="tool-panel">
                    <ToolButtons
                        allTools={Tools}
                        selectedTool={this.state.selectedTool}
                        onToolClicked={this.toggleTool}
                    />
                    {this.props.embeddingMode && (
                        <TrackRegionController
                            selectedRegion={viewRegion}
                            onRegionSelected={onNewRegion}
                            onToggleHighlight={onToggleHighlight}
                            onSetEnteredRegion={onSetEnteredRegion}
                        />
                    )}
                    <div className="tool-element" style={{ display: "flex", alignItems: "center" }}>
                        <ReorderMany
                            onOpenReorderManyModal={this.openReorderManyModal}
                            onCloseReorderManyModal={this.closeReorderManyModal}
                            showReorderManyModal={this.state.showReorderManyModal}
                        />
                    </div>
                    <ButtonGroup buttons={panLeftButton} />
                    {/* <ZoomButtons viewRegion={viewRegion} onNewRegion={onNewRegion} /> */}
                    <ZoomButtons viewRegion={viewRegion} onNewRegion={onNewRegion} zoomOut={this.zoomOut} />
                    <ButtonGroup buttons={panRightButton} />
                    <div className="tool-element" style={{ display: "flex", alignItems: "center" }}>
                        <UndoRedo />
                    </div>
                    <div className="tool-element" style={{ display: "flex", alignItems: "center" }}>
                        <History />
                    </div>
                    <div className="tool-element" style={{ display: "flex", height: "10vh"}}>
                        <HighlightMenu
                            menuOpen={this.state.selectedTool === Tools.HIGHLIGHT}
                        />
                    </div>
                    <div className="tool-element" style={{ minWidth: "200px", alignSelf: "center" }}>
                        <PixelInfo
                            basesPerPixel={this.props.basesPerPixel}
                            viewRegion={viewRegion}
                            primaryView={primaryView}
                        />
                    </div>
                    <MetadataHeader
                        terms={metadataTerms}
                        onNewTerms={onMetadataTermsChanged}
                        suggestedMetaSets={suggestedMetaSets}
                    />
                </div>
            </div>
        );
    }

    getGroupScale = () => {
        const { tracks, trackData, primaryView } = this.props;
        const groupScale = this.groupManager.getGroupScale(
            tracks,
            trackData,
            primaryView.visWidth,
            primaryView.viewWindow
        );
        this.setState({ groupScale });
    };

    /**
     * @return {JSX.Element[]} track elements to render
     */
    makeTrackElements() {
        const {
            tracks,
            trackData,
            primaryView,
            metadataTerms,
            viewRegion,
            layoutModel,
            onSetAnchors3d,
            onSetGeneFor3d,
            viewer3dNumFrames,
            basesPerPixel,
            isThereG3dTrack,
            onSetImageInfo,
        } = this.props;

        const trackElements = tracks.map((trackModel, index) => {
            const id = trackModel.getId();
            const data = trackData[id];
            const layoutProps = getTrackConfig(trackModel).isImageTrack() ? { layoutModel } : {};
            return (
                <TrackHandle
                    key={trackModel.getId()}
                    trackModel={trackModel}
                    {...data}
                    viewRegion={data.visRegion}
                    width={primaryView.visWidth}
                    viewWindow={primaryView.viewWindow}
                    metadataTerms={metadataTerms}
                    xOffset={0}
                    panningAnimation={this.state.panningAnimation}
                    zoomAnimation={this.state.zoomAnimation}
                    index={index}
                    onContextMenu={this.handleContextMenu}
                    onClick={this.handleTrackClicked}
                    onMetadataClick={this.handleMetadataClicked}
                    selectedRegion={viewRegion}
                    // layoutModel={layoutModel}
                    getBeamRefs={this.getBeamRefs}
                    onSetAnchors3d={onSetAnchors3d}
                    onSetGeneFor3d={onSetGeneFor3d}
                    viewer3dNumFrames={viewer3dNumFrames}
                    basesPerPixel={basesPerPixel}
                    isThereG3dTrack={isThereG3dTrack}
                    onSetImageInfo={onSetImageInfo}
                    groupScale={this.state.groupScale}
                    {...layoutProps}
                />
            );
        });
        return trackElements;
    }

    /**
     * Renders a subcontainer that provides specialized track manipulation, depending on the selected tool.
     *
     * @return {JSX.Element} - subcontainer that renders tracks
     */
    renderSubContainer() {
        const { tracks, primaryView, onNewRegion, onTracksChanged } = this.props;
        const trackElements = this.makeTrackElements();
        switch (this.state.selectedTool) {
            case Tools.REORDER:
                return (
                    <ReorderableTrackContainer
                        trackElements={trackElements}
                        trackModels={tracks}
                        onTracksChanged={onTracksChanged}
                    />
                );
            case Tools.ZOOM_IN:
                return (
                    <ZoomableTrackContainer
                        trackElements={trackElements}
                        visData={primaryView}
                        onNewRegion={onNewRegion}
                    />
                );
            case Tools.DRAG:
                return (
                    <PannableTrackContainer
                        trackElements={trackElements}
                        visData={primaryView}
                        onNewRegion={onNewRegion}
                        xOffset={this.state.xOffset}
                        onXOffsetChanged={this.changeXOffset}
                    />
                );
            case Tools.HIGHLIGHT:
                return (
                    <HighlightableTrackContainer
                        trackElements={trackElements}
                        visData={primaryView}
                        onNewHighlight={HighlightNewRegion}
                    />
                )
            default:
                return trackElements;
        }
    }

    renderModal() {
        const { primaryView, trackData } = this.props;
        const { trackForCircletView, circletColor } = this.state;
        return (
            <ReactModal isOpen={this.state.showModal} contentLabel="circlet-opener" ariaHideApp={false}>
                <button onClick={this.handleCloseModal}>Close</button>
                <CircletView
                    primaryView={primaryView}
                    trackData={trackData}
                    track={trackForCircletView}
                    color={circletColor}
                    setCircletColor={this.setCircletColor}
                />
            </ReactModal>
        );
    }

    /**
     * @inheritdoc
     */
    render() {
        const {
            tracks,
            onTracksChanged,
            enteredRegion,
            highlightEnteredRegion,
            primaryView,
            viewRegion,
            highlightColor,
            basesPerPixel,
            trackData,
        } = this.props;
        if (!primaryView) {
            return null;
        }
        const { selectedTool } = this.state;
        const fileInfos = {}; // key, track id, value: fileInfo obj
        tracks.forEach((tk) => {
            const tkId = tk.getId();
            if (!_.isEmpty(trackData[tkId].fileInfo)) {
                fileInfos[tkId] = trackData[tkId].fileInfo;
            }
        });
        const contextMenu = (
            <TrackContextMenu
                tracks={tracks}
                onTracksChanged={onTracksChanged}
                deselectAllTracks={this.deselectAllTracks}
                onCircletRequested={this.handleOpenModal}
                onApplyMatplot={this.applyMatPlot}
                onApplyDynamicplot={this.applyDynamicPlot}
                onApplyDynamicHic={this.applyDynamicHic}
                onApplyDynamicLongrange={this.applyDynamicLongrange}
                onApplyDynamicBed={this.applyDynamicBed}
                basesPerPixel={basesPerPixel}
                fileInfos={fileInfos}
            />
        );
        const trackDivStyle = {
            border: "1px solid black",
            paddingBottom: "3px",
            cursor: selectedTool ? selectedTool.cursor : DEFAULT_CURSOR,
        };
        // console.log(enteredRegion, highlightColor, highlightEnteredRegion, primaryView, this.state.xOffset);
        return (
            <React.Fragment>
                <OutsideClickDetector onOutsideClick={this.deselectAllTracks}>
                    {this.renderControls()}
                    <ContextMenuManager
                        menuElement={contextMenu}
                        shouldMenuClose={(event) => !SELECTION_BEHAVIOR.isToggleEvent(event)}
                    >
                        <DivWithBullseye style={trackDivStyle} id="trackContainer">
                            <div id="beamLeft" ref={this.leftBeam}>
                                {" "}
                                <div id="beamLeftInner"></div>{" "}
                            </div>
                            <div id="beamRight" ref={this.rightBeam}>
                                {" "}
                                <div id="beamRightInner"></div>{" "}
                            </div>
                            <VerticalDivider
                                visData={primaryView}
                                genomeRegion={viewRegion}
                                xOffset={this.state.xOffset}
                            >
                                <HighlightRegion
                                    enteredRegion={enteredRegion}
                                    highlightColor={highlightColor}
                                    highlightEnteredRegion={highlightEnteredRegion}
                                    visData={primaryView}
                                    xOffset={this.state.xOffset}
                                >
                                    {this.renderSubContainer()}
                                </HighlightRegion>
                            </VerticalDivider>
                        </DivWithBullseye>
                    </ContextMenuManager>
                </OutsideClickDetector>
                {this.renderModal()}
                <Hotkeys
                    keyName="alt+d,alt+h,alt+r,alt+s,alt+m,alt+z,alt+x,alt+i,alt+o,alt+g"
                    onKeyDown={this.onKeyDown.bind(this)}
                ></Hotkeys>
            </React.Fragment>
        );
    }
}

export default withEnhancements(TrackContainer);

function PixelInfo(props) {
    const { basesPerPixel, viewRegion, primaryView } = props;
    const viewBp = niceBpCount(viewRegion.getWidth());
    const windowWidth = primaryView.viewWindow.getLength();
    const span = niceBpCount(basesPerPixel, true);
    return (
        <span className="font-italic">
            Viewing a {viewBp} region in {Math.round(windowWidth)}px, 1 pixel spans {span}
        </span>
    );
}
