import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import TrackModel from '../../../model/TrackModel';
import SetLabelItem from './SetLabelItem';
import PrecisePopover from '../PrecisePopover';

import './ContextMenu.css';

export const ITEM_PROP_TYPES = {
    tracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)),
    onChange: PropTypes.func
};

export const ITEM_DEFAULT_PROPS = {
    tracks: [],
    onChange: () => undefined
};

/**
 * Context menu specialized for managing track options and metadata.
 * 
 * @author Silas Hsu
 */
class ContextMenu extends React.PureComponent {
    static propTypes = {
        x: PropTypes.number, // Page x coordinate of the menu's upper left corner
        y: PropTypes.number, // Page y coordinate of the menu's upper left corner

        /**
         * List of tracks to manage.  Only changes selected tracks, but it accepts unselected ones as to preserve track
         * positions in the onTracksChanged callback.
         */
        allTracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)),

        /**
         * Called when the menu has configured one or more tracks of allTracks.
         *     Signature: (nextTracks: TrackModel[]): void
         *         `nextTracks` - array of TrackModel derived from the `allTracks` prop
         */
        onTracksChanged: PropTypes.func,
        onClose: PropTypes.func, // Called when the menu would like to close.  Signature: (event: MouseEvent): void
    };

    static defaultProps = {
        allTracks: [],
        onTracksChanged: () => undefined,
    };

    constructor(props) {
        super(props);
        this.changeSelectedTracks = this.changeSelectedTracks.bind(this);
        this.removeSelectedTracks = this.removeSelectedTracks.bind(this);
    }

    renderTrackSpecificItems(selectedTracks) {
        let menuComponents = []; // Array of arrays, one for each track
        for (let trackModel of selectedTracks) {
            const menuItems = trackModel.getRenderConfig().menuItems;
            if (menuItems) {
                menuComponents.push(menuItems);
            } else { // Intersecting anything with the empty set is the empty set, so we can stop right here.
                menuComponents = [];
                break;
            }
        }

        const commonMenuComponents = _.intersection(menuComponents);
        return commonMenuComponents.map((MenuComponent, index) =>
            <MenuComponent key={index} tracks={selectedTracks} onChange={null} />
        );
    }

    changeSelectedTracks(mutate) {
        const nextTracks = this.props.allTracks.map(track => {
            if (track.isSelected) {
                let copy = track.clone();
                mutate(copy);
                return copy;
            } else {
                return track;
            }
        });
        this.props.onTracksChanged(nextTracks);
    }

    removeSelectedTracks() {
        const unselectedTracks = this.props.allTracks.filter(track => !track.isSelected);
        this.props.onTracksChanged(unselectedTracks);
    }

    render() {
        const {x, y, allTracks, onClose} = this.props;
        const selectedTracks = allTracks.filter(track => track.isSelected);
        if (selectedTracks.length === 0) {
            return null;
        }

        return (
        <PrecisePopover x={x} y={y} onClose={onClose} >
            <div className="ContextMenu-body">
                <MenuTitle tracks={selectedTracks} />
                <SetLabelItem tracks={selectedTracks} onChange={this.changeSelectedTracks} />
                {this.renderTrackSpecificItems(selectedTracks)}
                <RemoveItem numTracks={selectedTracks.length} onClick={this.removeSelectedTracks} />
            </div>
        </PrecisePopover>
        );
    }
}

/**
 * Title for the context menu.
 * 
 * @param {Object} props - props as specified by React.
 * @return {JSX.Element} element to render
 */
function MenuTitle(props) {
    const text = props.tracks.length === 1 ? props.tracks[0].name : `${props.tracks.length} tracks selected`;
    return <div style={{paddingLeft: 5, fontWeight: 'bold'}} >{text}</div>;
}

/**
 * A menu item that displays an option for track removal.  Note that the props for this item do not follow the schema
 * for other menu items.
 * 
 * @param {Object} props - props as specified by React.
 * @return {JSX.Element} element to render
 */
function RemoveItem(props) {
    return (
    <div onClick={props.onClick} className="ContextMenu-item ContextMenu-hoverable-item-danger" >
        {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
        ❌ {props.numTracks === 1 ? "Remove" : `Remove ${props.numTracks} tracks`}
    </div>
    );
}

export default ContextMenu;
