import React from "react";
import FlexLayout from "flexlayout-react";
import shortid from "shortid";
import { connect } from "react-redux";
import _ from "lodash";
import { GlobalActionCreators } from "./AppState";
import withCurrentGenome from "./components/withCurrentGenome";
import App from "./App";
// import G3dContainer from "components/trackVis/3d/G3dContainer";
// import MolstarContainer from "components/trackVis/3d/MolstarContainer";
import ThreedmolContainer from "components/trackVis/3dmol/ThreedmolContainer";
import { BrowserScene } from "./components/vr/BrowserScene";
import ErrorBoundary from "./components/ErrorBoundary";
import { RegionExpander } from "model/RegionExpander";
import TrackModel from "model/TrackModel";
import {
    addTabSetToLayout,
    deleteTabByIdFromLayout,
    initialLayout,
    tabIdExistInLayout,
    deleteTabByIdFromModel,
    ensureLayoutHeader,
} from "./layoutUtils";
import OmeroContainer from "components/trackVis/imageTrack/OmeroContainer";

// import "../node_modules/flexlayout-react/style/light.css";
import "./AppLayout.css";

/**
 * generate layout when VR is on, or g3d track submitted etc
 * @author Daofeng Li
 */
const REGION_EXPANDER = new RegionExpander(1);
const REGION_EXPANDER0 = new RegionExpander(0);

function mapStateToProps(state) {
    return {
        viewRegion: state.browser.present.viewRegion,
        tracks: state.browser.present.tracks,
        isShowingVR: state.browser.present.isShowingVR,
        layout: state.browser.present.layout,
        selectedSet: state.browser.present.regionSetView,
        darkTheme: state.browser.present.darkTheme,
    };
}

const callbacks = {
    onNewViewRegion: GlobalActionCreators.setViewRegion,
    onTracksChanged: GlobalActionCreators.setTracks,
    onToggleVR: GlobalActionCreators.toggleVR,
    onSetLayout: GlobalActionCreators.setLayout,
    onSetSelected: GlobalActionCreators.setRegionSetView,
};

class AppLayout extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            anchors3d: [],
            sync3d: false,
            viewer3dNumFrames: null,
            geneFor3d: null,
            g3dcount: 0,
            imageInfo: null,
        };
        this.handleNodeResize = _.debounce(this.handleNodeResize, 250);
    }

    componentDidMount() {
        // const {tracks} = this.props;
        // const g3dtracks = tracks.filter((tk) => tk.type === "g3d");
        // if(g3dtracks.length) {
        //     this.setState({g3dcount: g3dtracks.length})
        // }
        const g3dcount = this.checkG3dLayout();
        this.setState({ g3dcount });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.isShowingVR !== this.props.isShowingVR) {
            if (this.props.isShowingVR) {
                const vrTabset = {
                    type: "tabset",
                    children: [
                        {
                            type: "tab",
                            name: "VR",
                            component: "vr",
                            id: "vr",
                        },
                    ],
                };
                const layout = tabIdExistInLayout(this.props.layout, "vr")
                    ? this.props.layout
                    : addTabSetToLayout(vrTabset, this.props.layout);
                this.props.onSetLayout(layout);
            } else {
                const layout = deleteTabByIdFromLayout(this.props.layout, "vr");
                this.props.onSetLayout(layout);
            }
        }
        if (prevProps.tracks !== this.props.tracks) {
            const prevG3dtracks = prevProps.tracks.filter((t) => t.type === "g3d");
            const prevIds = prevG3dtracks.map((tk) => tk.getId());
            const currentG3dtracks = this.props.tracks.filter((t) => t.type === "g3d");
            const g3dtracks = currentG3dtracks.filter((tk) => !prevIds.includes(tk.getId()));
            let layout = { ...this.props.layout };
            if (g3dtracks.length) {
                this.setState((prevState) => {
                    return { g3dcount: prevState.g3dcount + g3dtracks.length };
                });
                g3dtracks.forEach((tk) => {
                    const tabId = shortid.generate();
                    const addLayout = {
                        type: "tabset",
                        children: [
                            {
                                type: "tab",
                                name: tk.getDisplayLabel(),
                                component: "g3d",
                                id: tabId,
                                config: {
                                    trackModel: tk.serialize(),
                                    tabId,
                                    trackId: tk.getId(),
                                },
                            },
                        ],
                    };
                    layout = addTabSetToLayout(addLayout, layout);
                });
                this.props.onSetLayout(layout);
            }
        }
        if (prevProps.layout !== this.props.layout) {
            const g3dcount = this.checkG3dLayout();
            this.setState({ g3dcount });
        }
    }

    checkG3dLayout = () => {
        const { layout } = this.props;
        if (!_.isEmpty(layout)) {
            const model = FlexLayout.Model.fromJson(layout);
            // console.log(layout, model, model._idMap);
            let g3dcount = 0;
            Object.keys(model._idMap).forEach((k) => {
                const node = model.getNodeById(k);
                if (node.getType() === "tab") {
                    const component = node.getComponent();
                    if (component === "g3d") {
                        g3dcount++;
                    }
                }
            });
            return g3dcount;
        }
        return 0;
    };

    setAnchors3d = (anchors) => {
        this.setState({ anchors3d: anchors });
    };

    setGeneFor3d = (gene) => {
        this.setState({ geneFor3d: gene });
    };

    getViewer3dAndNumFrames = (viewer3dNumFrames) => {
        this.setState({ viewer3dNumFrames });
    };

    toggleSync3d = (isSync3d) => {
        this.setState({ sync3d: isSync3d });
    };

    setImageInfo = (info) => {
        this.setState({ imageInfo: info });
    };

    handleNodeResize = (node) => {
        const model = node.getModel();
        if (model) {
            // const tabIds = Object.keys(model._idMap);
            // tabIds.forEach((tabId) => {
            //     const node = model._idMap[tabId];
            //     if (node.type === "tab") {
            //     }
            // });
            // const app = model.getNodeById("app");
            // console.log(app.getId(), app.getParent().getWeight());
            // model.doAction(
            //     FlexLayout.Actions.updateNodeAttributes(app.getParent().getId(), { weight: app.getParent().getWeight() })
            // );
            const parent = node.getParent();
            // console.log(node.getId(), parent.getWeight());
            model.doAction(FlexLayout.Actions.updateNodeAttributes(parent.getId(), { weight: parent.getWeight() }));
            // console.log(model);
            this.props.onSetLayout(model.toJson());
        }
    };

    renderApp = (node) => {
        const model = node ? node.getModel() : FlexLayout.Model.fromJson(initialLayout);
        // if (node) {
        //     node.setEventListener("resize", () => this.handleNodeResize(node));
        // }
        // const isThereG3dTrack = tracks.filter((tk) => tk.type === "g3d").length > 0; // not working sometimes after browser app track selection
        // console.log(this.state.g3dcount);
        return (
            <div className="bg">
                <App
                    layoutModel={model}
                    onSetAnchors3d={this.setAnchors3d}
                    onSetGeneFor3d={this.setGeneFor3d}
                    viewer3dNumFrames={this.state.viewer3dNumFrames}
                    isThereG3dTrack={this.state.g3dcount > 0}
                    onSetImageInfo={this.setImageInfo}
                />
            </div>
        );
    };

    renderVRscene = (node) => {
        const { viewRegion, tracks, genomeConfig } = this.props;
        node.setEventListener("close", () => {
            this.props.onToggleVR();
        });
        // node.setEventListener("resize", () => this.handleNodeResize(node));
        return (
            <ErrorBoundary>
                <BrowserScene
                    viewRegion={viewRegion}
                    tracks={tracks}
                    expansionAmount={REGION_EXPANDER}
                    genomeConfig={genomeConfig}
                />
            </ErrorBoundary>
        );
    };

    // render3Dscene = (node) => {
    //     const { viewRegion, genomeConfig } = this.props;
    //     const config = node.getConfig();
    //     // console.log(config);
    //     const g3dtrack = TrackModel.deserialize(config.trackModel);
    //     g3dtrack.id = config.trackId;
    //     node.setEventListener("close", () => {
    //         const layout = deleteTabByIdFromLayout(this.props.layout, config.tabId);
    //         this.props.onSetLayout(layout);
    //     });
    //     return (
    //         <ErrorBoundary>
    //             <G3dContainer
    //                 viewRegion={viewRegion}
    //                 tracks={[g3dtrack]}
    //                 expansionAmount={REGION_EXPANDER0}
    //                 genomeConfig={genomeConfig}
    //             />
    //         </ErrorBoundary>
    //     );
    // };

    // renderMolStarContainer = (node) => {
    //     const { viewRegion, genomeConfig } = this.props;
    //     const config = node.getConfig();
    //     const g3dtrack = TrackModel.deserialize(config.trackModel);
    //     g3dtrack.id = config.trackId;
    //     node.setEventListener("close", () => {
    //         const layout = deleteTabByIdFromLayout(this.props.layout, config.tabId);
    //         this.props.onSetLayout(layout);
    //         this.removeTrackById(g3dtrack.id);
    //     });
    //     return (
    //         <ErrorBoundary>
    //             <MolstarContainer
    //                 viewRegion={viewRegion}
    //                 tracks={[g3dtrack]}
    //                 expansionAmount={REGION_EXPANDER0}
    //                 genomeConfig={genomeConfig}
    //             />
    //         </ErrorBoundary>
    //     );
    // };

    render3dmolContainer = (node) => {
        const model = node.getModel();
        const { viewRegion, genomeConfig, tracks, onNewViewRegion, onSetSelected, selectedSet, darkTheme } = this.props;
        const config = node.getConfig();
        const { x, y, width, height } = node.getRect();
        const g3dtrack = TrackModel.deserialize(config.trackModel);
        g3dtrack.id = config.trackId;
        const origG3d = tracks.filter((tk) => tk.getId() === g3dtrack.id);
        g3dtrack.fileObj = origG3d.length ? origG3d[0].fileObj : null;
        // const currentTrackIds = tracks.map((tk) => tk.getId());
        // if (!currentTrackIds.includes(g3dtrack.id)) {
        //     const newTracks = [...tracks, g3dtrack];
        //     this.props.onTracksChanged(newTracks);
        // }
        node.setEventListener("close", () => {
            this.removeTrackById(g3dtrack.id);
            const layout = deleteTabByIdFromModel(model, config.tabId);
            this.props.onSetLayout(layout);
        });
        // node.setEventListener("resize", () => this.handleNodeResize(node));
        return (
            <ThreedmolContainer
                viewRegion={viewRegion}
                tracks={tracks}
                g3dtrack={g3dtrack}
                expansionAmount={REGION_EXPANDER0}
                genomeConfig={genomeConfig}
                width={width}
                height={height}
                x={x}
                y={y}
                anchors3d={this.state.anchors3d}
                geneFor3d={this.state.geneFor3d}
                onSetAnchors3d={this.setAnchors3d}
                onNewViewRegion={onNewViewRegion}
                sync3d={this.state.sync3d}
                onToggleSync3d={this.toggleSync3d}
                onGetViewer3dAndNumFrames={this.getViewer3dAndNumFrames}
                imageInfo={this.state.imageInfo}
                onSetSelected={onSetSelected}
                selectedSet={selectedSet}
                darkTheme={darkTheme}
            />
        );
    };

    renderOmeroContainer = (node) => {
        const model = node.getModel();
        const config = node.getConfig();
        const { imageId, tabId, imageUrl, imageUrlSuffix, detailUrl } = config;
        node.setEventListener("close", () => {
            const layout = deleteTabByIdFromModel(model, tabId);
            this.props.onSetLayout(layout);
        });
        // node.setEventListener("resize", () => this.handleNodeResize(node));
        return (
            <ErrorBoundary>
                <OmeroContainer
                    imageId={imageId}
                    imageUrl={imageUrl}
                    imageUrlSuffix={imageUrlSuffix}
                    detailUrl={detailUrl}
                />
            </ErrorBoundary>
        );
    };

    factory = (node) => {
        const layoutComponent = node.getComponent();
        node.setEventListener("resize", () => this.handleNodeResize(node));
        const layoutFuncs = {
            app: (node) => this.renderApp(node),
            vr: (node) => this.renderVRscene(node),
            g3d: (node) => this.render3dmolContainer(node),
            omero: (node) => this.renderOmeroContainer(node),
        };
        return layoutFuncs[layoutComponent](node);
    };

    removeTrackById(trackId) {
        this.setState((prevState) => {
            return { g3dcount: Math.max(prevState.g3dcount - 1, 0) };
        });
        const newTracks = this.props.tracks.filter((track) => track.getId() !== trackId);
        this.props.onTracksChanged(newTracks);
    }

    render() {
        const layout = _.isEmpty(this.props.layout) ? initialLayout : ensureLayoutHeader(this.props.layout);
        const model = FlexLayout.Model.fromJson(layout);
        const theme = this.props.darkTheme ? "dark" : "light";
        return (
            <div style={{ width: "100%", height: "100%" }} id="flex-container" data-theme={theme}>
                <FlexLayout.Layout model={model} factory={this.factory} />
            </div>
        );

        // if there is no new tabs, no need to use layout?
        // if (_.isEmpty(this.props.layout)) {
        //     return this.renderApp();
        // } else {
        // console.log(this.props.layout);
        // const model = FlexLayout.Model.fromJson(this.props.layout);
        // console.log(model);
        // return <FlexLayout.Layout model={model} factory={this.factory} />;
        // }
    }
}

const withAppState = connect(mapStateToProps, callbacks);
const withEnhancements = _.flowRight(withAppState, withCurrentGenome);
export default withEnhancements(AppLayout);
