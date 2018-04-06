import PropTypes from 'prop-types';
import React from 'react';
import AnnotationTrackSelector from './AnnotationTrackSelector';
import HubPane from './HubPane'
import CustomTrackAdder from './CustomTrackAdder';

import './TrackManager.css';

/**
 * A complete specification for a submenu.
 * 
 * @typedef {Object} Submenu
 * @property {string} buttonText - the text on the button that will toggle display of the submenu
 * @property {React.Component} component - submenu componennt.  Will get all the props of the parent.
 */
const SUBMENUS = [
    {
        buttonText: "Annotation tracks...",
        component: AnnotationTrackSelector,
    },
    {
        buttonText: "Data hubs...",
        component: HubPane,
    },
    {
        buttonText: "Custom track...",
        component: CustomTrackAdder,
    },
];

/**
 * All the UI for managing tracks: adding them, deleting them, looking at what tracks are available, etc.
 * 
 * @author Silas Hsu
 */
class TrackManager extends React.Component {
    static propTypes = {
        addedTracks: PropTypes.arrayOf(PropTypes.object),
        onTrackAdded: PropTypes.func,
        onTrackRemoved: PropTypes.func
    };

    static defaultProps = {
        onTrackAdded: () => undefined,
        onTrackRemoved: () => undefined,
    };

    constructor(props) {
        super(props);
        this.state = {
            activeSubmenu: null,
        };

        this.submenuButtonClicked = this.submenuButtonClicked.bind(this);
    }

    /**
     * Sets state, toggling a particular submenu's display status.  Also ensures that only one submenu is displayed at
     * a time.
     * 
     * @param {TrackManager~Submenu} submenu - an element of this.submenus
     */
    submenuButtonClicked(submenu) {
        if (this.state.activeSubmenu === submenu) {
            this.setState({activeSubmenu: null});
        } else {
            this.setState({activeSubmenu: submenu});
        }
    }

    /**
     * Renders current tracks displayed, buttons for showing submenus, and the current submenu
     * 
     * @return {JSX.Element} the element to render
     * @override
     */
    render() {
        const {addedTracks, onTrackRemoved} = this.props;
        const activeSubmenu = this.state.activeSubmenu;
        const currentTrackList = addedTracks.map((track, index) => (
            <li key={index}>
                {track.getDisplayLabel()}
                <button className="btn btn-danger" onClick={() => onTrackRemoved(index)} >Remove</button>
            </li>
            )
        );

        const submenuButtons = SUBMENUS.map((submenu, index) =>
            <button
                key={index}
                className={activeSubmenu === submenu ? "btn btn-primary" : "btn btn-light"}
                onClick={() => this.submenuButtonClicked(submenu)}
            >
                {submenu.buttonText}
            </button>
        );

        let submenuElement = null;
        if (activeSubmenu) {
            const Submenu = activeSubmenu.component;
            submenuElement = <div className="TrackManager-submenu"><Submenu {...this.props} /></div>;
        }

        return (
        <div className="TrackManager-parent">
            <div className="TrackManager-sidebar">
                <h3>Current tracks</h3>
                <ul>{currentTrackList}</ul>
                <h3>Add tracks</h3>
                <div className="btn-group-vertical">
                    {submenuButtons}
                </div>
            </div>
            {submenuElement}
        </div>);
    }
}

export default TrackManager;
