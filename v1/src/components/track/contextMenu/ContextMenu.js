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

function MenuTitle(props) {
    let text;
    if (props.selectedTracks.length === 1) {
        text = `${props.selectedTracks[0].name}`;
    } else {
        text = `${props.selectedTracks.length} tracks selected`;
    }

    return <div style={{paddingLeft: 5, fontWeight: 'bold'}} >{text}</div>;
}

function RemoveItem(props) {
    return (
    <div onClick={props.onClick} className="ContextMenu-item ContextMenu-hoverable-item" >
        {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
        ❌ {props.numTracks === 1 ? "Remove" : `Remove ${props.numTracks} tracks`}
    </div>
    );
}

class ContextMenu extends React.PureComponent {
    static propTypes = {
        x: PropTypes.number,
        y: PropTypes.number,
        allTracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)),
        onTracksChanged: PropTypes.func,
        onClose: PropTypes.func,
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
                <MenuTitle selectedTracks={selectedTracks} />
                <SetLabelItem tracks={selectedTracks} onChange={this.changeSelectedTracks} />
                {this.renderTrackSpecificItems(selectedTracks)}
                <RemoveItem numTracks={selectedTracks.length} onClick={this.removeSelectedTracks} />
            </div>
        </PrecisePopover>
        );
    }
}

export default ContextMenu;
