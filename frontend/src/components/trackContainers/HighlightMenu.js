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
 * Gets props to pass to RegionSetSelector.
 * 
 * FIXME
 * 
 * @param {Object} state - redux state
 * @return {Object} props to pass to RegionSetSelector
 */
 function mapStateToProps(state) {
    return {
        highlightItems: state.browser.present.highlightItems
    };
}

/**
 * Callbacks to pass to HighlightMenu
 */
const callbacks = {
    onSetsChanged: ActionCreators.setHighlights
};

/**
 * Menu for managing multiple highlights created on TrackContainer
 * 
 * Read up on Redux;
 * For Redux storage of highlightItems data:
 *      Create switch case for UPDATE_HIGHLIGHT_ITEMS in NextState method in AppState.ts;
 *      Set items in Redux storage with ActionCreator.METHOD();
 *      Create withAppState = connect(mapStateToProps, callbacks);
 *          Find out how this works, this is how you store and access data in Redux;
 *          Connect is the most important part;
 */
class HighlightMenu extends React.Component {
    static propTypes = {
        highlightItems: PropTypes.arrayOf(PropType.object).isRequired,
        menuOpen: PropTypes.bool
    };

    constructor() {
        super(props);
        this.state = {

        };
    }

    render() {
        const { highlightItems, menuOpen } = this.props;
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

        if (menuOpen) {
            return (
                <div className="highlightMenu-body">
                    {highlightElements}
                </div>
            );
        }
    }
}

export default connect(mapStateToProps, callbacks)(HighlightMenu);

class HighlightItem extends React.Component {
    static propTypes = {
        color: PropTypes.string,
        opacity: PropTypes.number
    }
}