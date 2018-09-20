import React from 'react';
import PropTypes from 'prop-types';
import HubTable from './HubTable';
import TrackModel from '../../model/TrackModel';
import FacetTable from './FacetTable';

import './HubPane.css';

/**
 * The window containing UI for loading public track hubs and adding tracks from hubs.
 * 
 * @author Silas Hsu
 */
class HubPane extends React.PureComponent {
    static propTypes = {
        addedTracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)),
        onTracksAdded: PropTypes.func
    };

    constructor(props) {
        super(props);
        this.state = {
            availableTracks: [],
        };
        this.addToAvailableTracks = this.addToAvailableTracks.bind(this);
    }

    /**
     * Adds a list of tracks to the list of all tracks available from a hub.
     * 
     * @param {TrackModel[]} newTracks - additions to the list of all tracks available from a hub
     * @param {boolean} makeVisible - whether to also add the tracks to the visible (added) track list
     */
    addToAvailableTracks(newTracks, makeVisible=false) {
        this.setState({availableTracks: this.state.availableTracks.concat(newTracks)});
        if (makeVisible) {
            this.props.onTracksAdded(newTracks)
        }
    }

    /**
     * Renders:
     *     Conditionally, public track hub list
     *     Conditionally, form to load a custom hub
     *     Buttons to show and hide the above
     *     If there are any tracks from hubs, a track list
     * 
     * @return {JSX.Element} the element to render
     * @override
     */
    render() {
        return (
        <div>
             <HubTable onHubLoaded={this.addToAvailableTracks} />
            {
            this.state.availableTracks.length > 0 ?
                <FacetTable
                    tracks={this.state.availableTracks}
                    addedTracks={this.props.addedTracks}
                    onTracksAdded={this.props.onTracksAdded}
                /> :
                <p>No tracks from data hubs yet.  Load a hub first.</p>
            }
        </div>
        );
    }
}

export default HubPane;
