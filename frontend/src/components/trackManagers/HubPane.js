import React from 'react';
import PropTypes from 'prop-types';
import HubTable from './HubTable';
import TrackModel from '../../model/TrackModel';
import FacetTable from './FacetTable';
import { getSecondaryGenomes } from '../../util';
import { getGenomeConfig } from '../../model/genomes/allGenomes';

/**
 * The window containing UI for loading public track hubs and adding tracks from hubs.
 * 
 * @author Silas Hsu
 */
class HubPane extends React.PureComponent {
    static propTypes = {
        addedTracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)),
        publicTracksPool: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)),
        onTracksAdded: PropTypes.func,
        onAddTracksToPool: PropTypes.func,
        addTermToMetaSets: PropTypes.func,
        addedTrackSets: PropTypes.instanceOf(Set),
        publicTrackSets: PropTypes.instanceOf(Set),
    };

    constructor(props) {
        super(props);
        this.state = {
            // availableTracks: [],
            secondConfigs: this.getSecondConfigs()
        };
        // this.addToAvailableTracks = this.addToAvailableTracks.bind(this);
    }

    /**
     * Adds a list of tracks to the list of all tracks available from a hub.
     * 
     * @param {TrackModel[]} newTracks - additions to the list of all tracks available from a hub
     * @param {boolean} makeVisible - whether to also add the tracks to the visible (added) track list
     */
    // addToAvailableTracks(newTracks, makeVisible=false) {
    //     this.setState({availableTracks: this.state.availableTracks.concat(newTracks)});
    //     if (makeVisible) {
    //         this.props.onTracksAdded(newTracks)
    //     }
    // }

    // copied from AnnotationTrackUI.js:
    getSecondConfigs = () => {
        const secondaryGenomes = getSecondaryGenomes(this.props.genomeConfig.genome.getName(), this.props.addedTracks);
        return secondaryGenomes.map(g => getGenomeConfig(g));
    }

    SecondaryTables (publicHubs, publicTracksPool) {
        return (
            <div>
            <HubTable 
                onHubLoaded={this.props.onAddTracksToPool}
                onTracksAdded={this.props.onTracksAdded}
                publicHubs={this.state.secondConfigs[0].publicHubList.slice()}
                onHubUpdated={this.props.onHubUpdated}
            />
            <FacetTable
                tracks={this.props.publicTracksPool} // need include add tracks, also need consider track remove to just remove from sets
                addedTracks={this.props.addedTracks}
                onTracksAdded={this.props.onTracksAdded}
                publicTrackSets={this.props.publicTrackSets}
                addedTrackSets={this.props.addedTrackSets}
                addTermToMetaSets={this.props.addTermToMetaSets}
                genomeName={this.props.genomeConfig.genome.getName()}
            />
            </div>
        );
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
        console.log(this.props);
        console.log(this.state.secondConfigs);
        return (
        <div>
             <HubTable 
                onHubLoaded={this.props.onAddTracksToPool}
                onTracksAdded={this.props.onTracksAdded}
                publicHubs={this.props.publicHubs} 
                onHubUpdated={this.props.onHubUpdated}
             />
            {
            this.props.publicTracksPool.length > 0 ?
                <FacetTable
                    tracks={this.props.publicTracksPool} // need include add tracks, also need consider track remove to just remove from sets
                    addedTracks={this.props.addedTracks}
                    onTracksAdded={this.props.onTracksAdded}
                    publicTrackSets={this.props.publicTrackSets}
                    addedTrackSets={this.props.addedTrackSets}
                    addTermToMetaSets={this.props.addTermToMetaSets}
                    genomeName={this.props.genomeConfig.genome.getName()}
                /> :
                <p>No tracks from data hubs yet.  Load a hub first.</p>
            }
            <HubTable 
                onHubLoaded={this.props.onAddTracksToPool}
                onTracksAdded={this.props.onTracksAdded}
                publicHubs={this.state.secondConfigs[0].publicHubList.slice()} 
                onHubUpdated={this.props.onHubUpdated}
             />
            {
            this.props.publicTracksPool.length > 0 ?
                <FacetTable
                    tracks={this.props.publicTracksPool} // need include add tracks, also need consider track remove to just remove from sets
                    addedTracks={this.props.addedTracks}
                    onTracksAdded={this.props.onTracksAdded}
                    publicTrackSets={this.props.publicTrackSets}
                    addedTrackSets={this.props.addedTrackSets}
                    addTermToMetaSets={this.props.addTermToMetaSets}
                    genomeName={this.state.secondConfigs[0].genome.getName()}
                /> :
                <p>No tracks from data hubs yet.  Load a hub first.</p>
            }
        </div>
        );
    }
}

export default HubPane;
