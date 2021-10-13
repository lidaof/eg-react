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
import { HighlightableTrackContainer } from "./HighlightableTrackContainer";
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
import { VerticalDivider } from "./VerticalDivider";
import { CircletView } from "./CircletView";
import ButtonGroup from "./ButtonGroup";
import TrackRegionController from "../genomeNavigator/TrackRegionController";
import ReorderMany from "./ReorderMany";
import { niceBpCount } from "../../util";

import "./HighlightMenu.css";
import { GroupedTrackManager } from "components/trackManagers/GroupedTrackManager";
import { getTrackConfig } from "components/trackConfig/getTrackConfig";

/**
 * Menu for managing multiple highlights created on TrackContainer
 */
export default class HighlightMenu extends React.Component {

    constructor() {
        this.state ={
            showMenu: false,
        }
    }

    openMenu() {
        this.setState({ showMenu: true });
    }

    closeMenu() {
        this.setState({ showMenu: false });
    }

    render() {
        const { highlightItems } = this.props;
        const highlightElements = highlightItems.map(item => {
            if (item.active && item.inViewRegion) {
                return (
                    <HighlightItem
                        color={item.color}
                        opacity={item.opacity}

                    />
                );
            }
        });

        return (
            <div className="highlightMenu-body">
                {highlightElements}
            </div>
        );
    }
}

class HighlightItem extends React.Component {

}