import React from "react";
import FlexLayout from "flexlayout-react";
import shortid from "shortid";
import { connect } from "react-redux";
import _ from "lodash";
import { ActionCreators } from "./AppState";
import withCurrentGenome from "./components/withCurrentGenome";
import App from "./App";
// import G3dContainer from "components/trackVis/3d/G3dContainer";
// import MolstarContainer from "components/trackVis/3d/MolstarContainer";
import ThreedmolContainer from "components/trackVis/3dmol/ThreedmolContainer";
import { BrowserScene } from "./components/vr/BrowserScene";
import ErrorBoundary from "./components/ErrorBoundary";
import { RegionExpander } from "model/RegionExpander";
import { addTabSetToLayout, deleteTabByIdFromLayout, initialLayout, tabIdExistInLayout } from "./layoutUtils";
import TrackModel from "model/TrackModel";
import OmeroContainer from "components/trackVis/imageTrack/OmeroContainer";

import "../node_modules/flexlayout-react/style/light.css";
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
    };
}

const callbacks = {
    onNewViewRegion: ActionCreators.setViewRegion,
    onTracksChanged: ActionCreators.setTracks,
    onToggleVR: ActionCreators.toggleVR,
    onSetLayout: ActionCreators.setLayout,
};

class AppLayout extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            anchors3d: [],
            sync3d: false,
            viewer3dNumFrames: null,
        };
        this.handleNodeResize = _.debounce(this.handleNodeResize, 250);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
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
            const g3dtracks = this.props.tracks.filter((t) => t.type === "g3d");
            let layout = { ...this.props.layout };
            if (g3dtracks.length) {
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
    }

    setAnchors3d = (anchors) => {
        this.setState({ anchors3d: anchors });
    };

    getViewer3dAndNumFrames = (viewer3dNumFrames) => {
        this.setState({ viewer3dNumFrames });
    };

    toggleSync3d = (isSync3d) => {
        this.setState({ sync3d: isSync3d });
    };

    handleNodeResize = (node) => {
        const layout = _.isEmpty(this.props.layout) ? initialLayout : this.props.layout;
        const model = FlexLayout.Model.fromJson(layout);
        const parent = node.getParent();
        model.doAction(FlexLayout.Actions.updateNodeAttributes(parent.getId(), { weight: parent.getWeight() }));
        this.props.onSetLayout(model.toJson());
    };

    renderApp = (node) => {
        const model = node ? node.getModel() : initialLayout;
        // if (node) {
        //     node.setEventListener("resize", () => this.handleNodeResize(node));
        // }
        return (
            <App
                layoutModel={model}
                onSetAnchors3d={this.setAnchors3d}
                viewer3dNumFrames={this.state.viewer3dNumFrames}
            />
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
        const { viewRegion, genomeConfig, tracks, onNewViewRegion } = this.props;
        const config = node.getConfig();
        const { x, y, width, height } = node.getRect();
        const g3dtrack = TrackModel.deserialize(config.trackModel);
        g3dtrack.id = config.trackId;
        node.setEventListener("close", () => {
            const layout = deleteTabByIdFromLayout(this.props.layout, config.tabId);
            this.props.onSetLayout(layout);
            this.removeTrackById(g3dtrack.id);
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
                onNewViewRegion={onNewViewRegion}
                sync3d={this.state.sync3d}
                onToggleSync3d={this.toggleSync3d}
                onGetViewer3dAndNumFrames={this.getViewer3dAndNumFrames}
            />
        );
    };

    renderOmeroContainer = (node) => {
        const config = node.getConfig();
        const { imageId, tabId, imageUrl, imageUrlSuffix, detailUrl } = config;
        node.setEventListener("close", () => {
            const layout = deleteTabByIdFromLayout(this.props.layout, tabId);
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
        let newTracks = this.props.tracks.filter((track) => track.id !== trackId);
        this.props.onTracksChanged(newTracks);
    }

    render() {
        const layout = _.isEmpty(this.props.layout) ? initialLayout : this.props.layout;
        const model = FlexLayout.Model.fromJson(layout);
        return <FlexLayout.Layout model={model} factory={this.factory} />;
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
