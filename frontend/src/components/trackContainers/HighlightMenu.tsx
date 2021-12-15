import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { connect } from "react-redux";
import AppState, { ActionCreators } from "../../AppState";
import { withTrackData } from "./TrackDataManager";
import { withTrackView } from "./TrackViewManager";
import TrackHandle from "./TrackHandle";
import { PannableTrackContainer } from "./PannableTrackContainer";
import ReorderableTrackContainer from "./ReorderableTrackContainer";
import { ZoomableTrackContainer } from "./ZoomableTrackContainer";
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

import { StateWithHistory } from 'redux-undo';

import "./HighlightMenu.css";
import OpenInterval from "model/interval/OpenInterval";
import ColorPicker from "components/ColorPicker";
import ChromosomeInterval from "model/interval/ChromosomeInterval";

/**
 * HighlightMenu and HighlightItem
 * @author Vincent Xu
 */

/**
 * Gets props to pass to HighlightMenu.js
 * 
 * @param {Object} state - redux state
 * @return {Object} props to pass to RegionSetSelector
 */
 function mapStateToProps(state: { browser: StateWithHistory<AppState> }) {
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

interface HighlightMenuProps {
    highlightItems: HighlightItemProps[];
    menuOpen: boolean;

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
export class HighlightMenu extends React.Component<HighlightMenuProps> {
    constructor(props: HighlightMenuProps) {
        super(props);
        this.state = {

        };

        this.handleDelete = this.handleDelete.bind(this);
        this.handleViewRegionJump = this.handleViewRegionJump.bind(this);
    }

    handleDelete(highlightNumber: number): void {
        const { highlightItems } = this.props;
        // const sourceItem = highlightItems.find(item => item.highlightNumber === highlightNumber);
        highlightItems.splice(highlightNumber, 1);
    }

    handleViewRegionJump(): void {

    }

    render() {
        const { highlightItems, menuOpen } = this.props;
        console.log(this.props);
        const highlightElements = highlightItems.map((item, counter) => {
            console.log(item);

            if (item.inViewRegion) {
                return (
                    <HighlightItem
                        color={item.color}
                        inViewRegion={item.inViewRegion}
                        highlightNumber={counter}
                        viewRegion={item.viewRegion}
                        handleDelete={this.handleDelete}
                        handleViewRegionJump={this.handleViewRegionJump}
                    />
                );
            } else {
                return null;
            }
        });

        if (menuOpen) {
            let emptyFiller = (highlightItems.length === 0 ? 'No Existing Highlights' : null);
            return (
                <div className="highlight-menu-body">
                    {highlightElements}
                    {emptyFiller}
                </div>
            );
        } else {
            return null;
        }
    }
}

export default connect(mapStateToProps, callbacks)(HighlightMenu);

export interface HighlightItemProps {
    active?: boolean;
    color?: string;
    highlightNumber?: number;
    highlightName?: string;
    highlightInterval?: OpenInterval;
    inViewRegion?: boolean;
    viewRegion?: ChromosomeInterval;
    handleDelete?: Function;
    handleViewRegionJump?: Function;
}

export class HighlightItem extends React.Component<HighlightItemProps, any> {



    constructor(props: HighlightItemProps) {
        super(props);

        this.state = {
            name: `Highlight ${this.props.highlightNumber}`,
            active: true,
        }

        this.updateName = this.updateName.bind(this);
        this.updateColor = this.updateColor.bind(this);
        this.showItem = this.showItem.bind(this);
        this.hideItem = this.hideItem.bind(this);
    }

    /**
     * Updates name of highlightItem, stores value in state of HighlightItem
     * @param evt value of name input
     */
    updateName(evt: any): void {
        console.log(evt);
        this.setState({ name: evt });
    }

    /**
     * updates the color of the highlight
     * @param evt new color input
     */
    updateColor(evt: any): void {

    }

    /**
     * Makes highlight visible
     */
    showItem(): void {
        this.setState({ active: true });
    }

    /**
     * Makes highlight invisible
     */
    hideItem(): void {
        this.setState({ active: false });
    }

    render(): JSX.Element {
        console.log(this.props);
        const { active, color, inViewRegion, viewRegion, handleDelete, handleViewRegionJump } = this.props;
        // const isInRegionText = (inViewRegion ? 'Within current view region' : 'Not within current view region');
        const isInRegionColor = (inViewRegion ? 'green' : 'red');

        return (
            <div className="highlight-item-body">
                {/* name input */}
                <input type="text" className="highlight-item-name" value={this.state.name} onChange={this.updateName} />
                {/* "is in view region" indicator */}
                <span
                    style={{
                        cursor: "pointer",
                        color: `${isInRegionColor}`,
                        fontSize: "1em",
                        position: "relative",
                        zIndex: "inherit",
                }}>
                    {`${viewRegion.chr}:${viewRegion.start}-${viewRegion.end}`}
                </span>
                {/* left: color picker; right: hide+show, delete buttons */}
                <div className="highlight-item-buttons-group">
                    <ColorPicker
                        color={color}
                        onChange={this.updateColor}
                    />
                    <button className="highlight-item-delete" onClick={() => { handleDelete(this.props.highlightNumber) }}>Delete</button>
                </div>
                {/* jump to this view region */}
            </div>
        );
    }
}