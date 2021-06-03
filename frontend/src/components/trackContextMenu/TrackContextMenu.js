import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import Collapsible from "react-collapsible";
import TrackModel from "../../model/TrackModel";
import { getTrackConfig, INTERACTION_TYPES } from "../trackConfig/getTrackConfig";
import { CopyToClip } from "../CopyToClipboard";

import "./TrackContextMenu.css";
import { NUMERRICAL_TRACK_TYPES } from "../trackManagers/CustomTrackAdder";
import { variableIsObject } from "../../util";

/**
 * Props that menu items will recieve.
 */
export const ITEM_PROP_TYPES = {
    /**
     * Track option objects to configure.
     */
    optionsObjects: PropTypes.arrayOf(PropTypes.object).isRequired,

    /**
     * Callback for when an option is set.  Signature (optionName: string, value: any): void
     *     `optionName` - key of options objects to set
     *     `value` - new value for the option
     */
    onOptionSet: PropTypes.func.isRequired,
};

/**
 * Context menu specialized for managing track options and metadata.
 *
 * @author Silas Hsu
 */
class TrackContextMenu extends React.PureComponent {
    static propTypes = {
        /**
         * List of tracks to manage.  Only changes selected tracks, but it accepts unselected ones as to preserve track
         * positions in the onTracksChanged callback.
         */
        tracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)),

        /**
         * Called when the menu has configured one or more tracks of tracks.
         *     Signature: (nextTracks: TrackModel[]): void
         *         `nextTracks` - array of TrackModel derived from the `tracks` prop
         */
        onTracksChanged: PropTypes.func,
        deselectAllTracks: PropTypes.func,
    };

    static defaultProps = {
        tracks: [],
        onTracksChanged: () => undefined,
        deselectAllTracks: () => undefined,
    };

    constructor(props) {
        super(props);
        this.changeSelectedTracks = this.changeSelectedTracks.bind(this);
        this.removeSelectedTracks = this.removeSelectedTracks.bind(this);
    }

    /**
     * Renders menu items that are specific to the types of the currently selected tracks.  Does an intersection so only
     * items that all of the selected tracks share get rendered.
     *
     * @return {JSX.Element[]} menu elements to render
     */
    renderTrackSpecificItems() {
        const { basesPerPixel } = this.props;
        const selectedTracks = this.props.tracks.filter((track) => track.isSelected);
        const trackConfigs = selectedTracks.map(getTrackConfig);
        let menuComponents = []; // Array of arrays, one for each track
        let optionsObjects = [];
        for (const config of trackConfigs) {
            const menuItems = config.getMenuComponents(basesPerPixel);
            if (!menuItems) {
                // Intersecting anything with the empty set is the empty set, so we can stop right here.
                return [];
            }
            menuComponents.push(menuItems);
            optionsObjects.push(config.getOptions());
        }

        const commonMenuComponents = _.intersection(...menuComponents);
        return commonMenuComponents.map((MenuComponent, index) => (
            <MenuComponent key={index} optionsObjects={optionsObjects} onOptionSet={this.changeSelectedTracks} />
        ));
    }

    /**
     * A callback for when menu items are changed.  Menu items should pass an option prop name and the new value for
     * that prop.  This function makes new tracks with the new option value, and passes them to the parent element.
     *
     */
    changeSelectedTracks(optionName, value) {
        const nextTracks = this.props.tracks.map((track) => {
            if (track.isSelected) {
                return track.cloneAndSetOption(optionName, value);
            } else {
                return track;
            }
        });
        this.props.onTracksChanged(nextTracks);
    }

    /**
     * Requests a removal of all selected tracks.
     */
    removeSelectedTracks() {
        const unselectedTracks = this.props.tracks.filter((track) => !track.isSelected);
        this.props.onTracksChanged(unselectedTracks);
    }

    /**
     * @inheritdoc
     */
    render() {
        const selectedTracks = this.props.tracks.filter((track) => track.isSelected);
        if (selectedTracks.length === 0) {
            return null;
        }

        return (
            <div className="TrackContextMenu-body">
                <MenuTitle tracks={selectedTracks} />
                {this.renderTrackSpecificItems(selectedTracks)}
                <CircletViewConfig tracks={selectedTracks} onCircletRequested={this.props.onCircletRequested} />
                <DeselectOption numTracks={selectedTracks.length} onClick={this.props.deselectAllTracks} />
                <RemoveOption numTracks={selectedTracks.length} onClick={this.removeSelectedTracks} />
                <TrackMoreInfo tracks={selectedTracks} />
                <MatplotMenu tracks={selectedTracks} onApplyMatplot={this.props.onApplyMatplot} />
                <DynamicplotMenu tracks={selectedTracks} onApplyDynamicplot={this.props.onApplyDynamicplot} />
                <DynamicHicMenu tracks={selectedTracks} onApplyDynamicHic={this.props.onApplyDynamicHic} />
                <DynamicLongrangeMenu
                    tracks={selectedTracks}
                    onApplyDynamicLongrange={this.props.onApplyDynamicLongrange}
                />
                <DynamicBedMenu tracks={selectedTracks} onApplyDynamicBed={this.props.onApplyDynamicBed} />
            </div>
        );
    }
}

/**
 * a menu item to invoke circlet view modal for interaction tracks
 */

function CircletViewConfig(props) {
    const numTracks = props.tracks.length;
    if (numTracks !== 1) {
        return null;
    }
    const track = props.tracks[0];
    if (!INTERACTION_TYPES.includes(track.type)) {
        return null;
    }
    return (
        <div className="TrackContextMenu-item">
            <button className="btn btn-info btn-sm btn-tight" onClick={() => props.onCircletRequested(track)}>
                Circlet view
            </button>
        </div>
    );
}

/**
 * a menu that applys matplot for more than 1 numerical tracks
 * @param {TrackModel[]} props
 */
function MatplotMenu(props) {
    const numTracks = props.tracks.length;
    if (numTracks === 1) {
        return null;
    }
    const trackTypes = props.tracks.map((tk) => tk.type);
    if (trackTypes.some((type) => !NUMERRICAL_TRACK_TYPES.includes(type))) {
        return null;
    }
    return (
        <div className="TrackContextMenu-item">
            <button className="btn btn-info btn-sm btn-tight" onClick={() => props.onApplyMatplot(props.tracks)}>
                Apply matplot
            </button>
        </div>
    );
}

/**
 * a menu that applys dynamic plot for more than 1 numerical tracks
 * @param {TrackModel[]} props
 */
function DynamicplotMenu(props) {
    const numTracks = props.tracks.length;
    if (numTracks === 1) {
        return null;
    }
    const trackTypes = props.tracks.map((tk) => tk.type);
    if (trackTypes.some((type) => !NUMERRICAL_TRACK_TYPES.includes(type))) {
        return null;
    }
    return (
        <div className="TrackContextMenu-item">
            <button className="btn btn-info btn-sm btn-tight" onClick={() => props.onApplyDynamicplot(props.tracks)}>
                Dynamic plot
            </button>
        </div>
    );
}

/**
 * a menu that applys dynamic hic for more than 1 hic tracks
 * @param {TrackModel[]} props
 */
function DynamicHicMenu(props) {
    const numTracks = props.tracks.length;
    if (numTracks === 1) {
        return null;
    }
    const trackTypes = props.tracks.map((tk) => tk.type);
    if (trackTypes.some((type) => type !== "hic")) {
        return null;
    }
    return (
        <div className="TrackContextMenu-item">
            <button className="btn btn-info btn-sm btn-tight" onClick={() => props.onApplyDynamicHic(props.tracks)}>
                Dynamic HiC
            </button>
        </div>
    );
}

/**
 * a menu that applys dynamic long range for more than 1 longrange tracks
 * @param {TrackModel[]} props
 */
function DynamicLongrangeMenu(props) {
    const numTracks = props.tracks.length;
    if (numTracks === 1) {
        return null;
    }
    const trackTypes = props.tracks.map((tk) => tk.type);
    if (trackTypes.some((type) => type !== "longrange")) {
        return null;
    }
    return (
        <div className="TrackContextMenu-item">
            <button
                className="btn btn-info btn-sm btn-tight"
                onClick={() => props.onApplyDynamicLongrange(props.tracks)}
            >
                Dynamic Longrange
            </button>
        </div>
    );
}

/**
 * a menu that applys dynamic bed for more than 1 bed tracks
 * @param {TrackModel[]} props
 */
function DynamicBedMenu(props) {
    const numTracks = props.tracks.length;
    if (numTracks === 1) {
        return null;
    }
    const trackTypes = props.tracks.map((tk) => tk.type);
    if (trackTypes.some((type) => type !== "bed")) {
        return null;
    }
    return (
        <div className="TrackContextMenu-item">
            <button className="btn btn-info btn-sm btn-tight" onClick={() => props.onApplyDynamicBed(props.tracks)}>
                Dynamic Bed
            </button>
        </div>
    );
}

function TrackMoreInfo(props) {
    const numTracks = props.tracks.length;
    if (numTracks !== 1) {
        return null;
    }
    const track = props.tracks[0];
    let info = [];
    if (track.details) {
        info.push(
            <div key="details">
                <ObjectAsTable title="Details" content={track.details} />
            </div>
        );
    }
    if (track.url) {
        info.push(
            <div key="url">
                <h6>
                    URL <CopyToClip value={track.url} />
                </h6>
                <p className="TrackContextMenu-URL">{track.url}</p>
            </div>
        );
    }
    if (track.metadata) {
        info.push(
            <div key="metadata">
                <ObjectAsTable title="Metadata" content={track.metadata} />
            </div>
        );
    }
    return (
        <Collapsible trigger="More information">
            <div className="TrackContextMenu-item">{info}</div>
        </Collapsible>
    );
}

export function ObjectAsTable(props) {
    const { title, content } = props;
    if (typeof content === "string") {
        return <div>{content}</div>;
    }
    const rows = Object.entries(content).map((values, idx) => {
        let tdContent;
        if (React.isValidElement(values[1])) {
            tdContent = values[1];
        } else if (variableIsObject(values[1])) {
            tdContent = <ObjectAsTable content={values[1]} />;
        } else {
            tdContent = Array.isArray(values[1]) ? values[1].join(" > ") : values[1];
        }
        return (
            <tr key={idx}>
                <td>{values[0]}</td>
                <td>{tdContent}</td>
            </tr>
        );
    });
    const tableTitle = title ? <h6>{title}</h6> : "";
    return (
        <React.Fragment>
            {tableTitle}
            <table className="table table-sm table-striped">
                <tbody>{rows}</tbody>
            </table>
        </React.Fragment>
    );
}
/**
 * Title for the context menu.
 *
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
function MenuTitle(props) {
    const numTracks = props.tracks.length;
    const text = numTracks === 1 ? props.tracks[0].getDisplayLabel() : `${numTracks} tracks selected`;
    return <div style={{ paddingLeft: 5, fontWeight: "bold" }}>{text}</div>;
}

/**
 * A menu item that displays an option for track removal.  Note that the props for this item do not follow the schema
 * for other menu items.
 *
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
function RemoveOption(props) {
    return (
        <div onClick={props.onClick} className="TrackContextMenu-item TrackContextMenu-hoverable-item-danger">
            {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}❌{" "}
            {props.numTracks === 1 ? "Remove" : `Remove ${props.numTracks} tracks`}
        </div>
    );
}

function DeselectOption(props) {
    if (props.numTracks === 1) {
        return null;
    }
    return (
        <div onClick={props.onClick} className="TrackContextMenu-item TrackContextMenu-hoverable-item-warn">
            {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}☐ {`Deselect ${props.numTracks} tracks`}
        </div>
    );
}

export default TrackContextMenu;
