import PropTypes from 'prop-types';
import React from 'react';
import AnnotationTrackSelector from './AnnotationTrackSelector';
import HubPane from './HubPane'

import './TrackManager.css';

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

    constructor(props) {
        super(props);
        this.state = {
            activeSubmenu: null,
        };

        this.submenuButtonClicked = this.submenuButtonClicked.bind(this);
        let self = this;
        this.submenus = [ // See doc below constructor for what each submenu object is
            {
                buttonText: "Annotation tracks...",
                getComponent: () => <AnnotationTrackSelector
                    addedTracks={self.props.addedTracks}
                    onTrackAdded={self.props.onTrackAdded}
                />,
            },
            {
                buttonText: "Data hubs...",
                getComponent: () => <HubPane
                    addedTracks={self.props.addedTracks}
                    onTrackAdded={self.props.onTrackAdded}
                />,
            },
            {
                buttonText: "Custom track...",
                getComponent: () => null,
            },
        ];
    }

    /**
     * A complete specification for a submenu.
     * 
     * @typedef {Object} TrackManager~Submenu
     * @property {string} buttonText - the text on the button that will toggle display of the submenu
     * @property {() => React.Component} getComponent - a function that provides the component to render for the submenu
     */

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
        let currentTrackList = this.props.addedTracks.map((track, index) => (
            <li key={index}>
                {track.getDisplayLabel()}
                <button
                    className="btn btn-danger"
                    onClick={event => this.props.onTrackRemoved ? this.props.onTrackRemoved(index) : undefined}
                >
                    Remove
                </button>
            </li>
            )
        );

        let submenuButtons = this.submenus.map((submenu, index) =>
            <button
                key={index}
                className={this.state.activeSubmenu === submenu ? "btn btn-primary" : "btn btn-light"}
                onClick={() => this.submenuButtonClicked(submenu)}
            >
                {submenu.buttonText}
            </button>
        , this);

        let submenu = null;
        if (this.state.activeSubmenu) {
            submenu = <div className="TrackManager-submenu">{this.state.activeSubmenu.getComponent()}</div>;
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
            {submenu}
        </div>);
    }
}

export default TrackManager;
