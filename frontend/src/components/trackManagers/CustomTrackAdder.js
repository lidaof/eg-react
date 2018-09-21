import React from 'react';
import PropTypes from 'prop-types';
import TrackModel from '../../model/TrackModel';
import CustomHubAdder from './CustomHubAdder';
import FacetTable from './FacetTable';

// Just add a new entry here to support adding a new track type.
const TRACK_TYPES = ['bigWig', 'bedGraph', 'bed', 'bigBed', 'hic', 'bam'];

/**
 * UI for adding custom tracks.
 * 
 * @author Silas Hsu
 */
class CustomTrackAdder extends React.Component {
    static propTypes = {
        addedTracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)),
        onTracksAdded: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.trackUI = null;
        this.state = {
            type: TRACK_TYPES[0],
            url: "",
            name: "",
            urlError: "",
            trackAdded: false,
            availableTracks: [],
        };
        this.handleSubmitClick = this.handleSubmitClick.bind(this);
        this.addToAvailableTracks = this.addToAvailableTracks.bind(this);
    }

    componentDidMount() {
        this.trackUI.click();
    }

    handleSubmitClick() {
        if (!this.props.onTracksAdded) {
            return;
        }

        if (!this.state.url) {
            this.setState({urlError: "Enter a URL"});
        } else {
            this.props.onTracksAdded([new TrackModel(this.state)]);
            this.setState({urlError: "", trackAdded: true});
        }
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

    renderTypeOptions() {
        return TRACK_TYPES.map(type => <option key={type} value={type} >{type}</option>);
    }

    renderButtons() {
        if (this.state.trackAdded) {
            return (
            <React.Fragment>
                <button className="btn btn-success" disabled={true} >Success</button>
                <button className="btn btn-link" onClick={() => this.setState({trackAdded: false})} >
                    Add another track
                </button>
            </React.Fragment>
            );
        } else {
            return <button className="btn btn-primary" onClick={this.handleSubmitClick} >Submit</button>;
        }
    }

    renderCustomTrackAdder() {
        const {type, url, name, urlError} = this.state;
        return (
        <form>
            <h1>Add custom track</h1>
            <div className="form-group">
                <label>Track type</label>
                <select className="form-control" value={type} onChange={event => this.setState({type: event.target.value})} >
                    {this.renderTypeOptions()}
                </select>
            </div>
            <div className="form-group">
                <label>Track label</label>
                <input type="text" className="form-control" value={name} onChange={event => this.setState({name: event.target.value})}/>
            </div>
            <div className="form-group">
                <label>Track file URL</label>
                <input type="text" className="form-control" value={url} onChange={event => this.setState({url: event.target.value})} />
                <span style={{color: "red"}} >{urlError}</span>
            </div>
            {this.renderButtons()}
        </form>
        )
    }

    renderCustomHubAdder() {
        return <CustomHubAdder onTracksAdded={tracks => this.addToAvailableTracks(tracks, true)} />;
    }

    render() {
        return (
            <div id="CustomTrackAdder">	  
                <ul className="nav nav-tabs" role="tablist">
                <li className="nav-item">
                    <a className="nav-link" href="#TrackAdd" role="tab" data-toggle="tab" ref={(trackUI) => this.trackUI = trackUI}>Add Custom Track</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#HubAdd" role="tab" data-toggle="tab">Add Custom Data Hub</a>
                </li>
                </ul>
                <div className="tab-content">
                <div role="tabpanel" className="tab-pane fade" id="TrackAdd">{this.renderCustomTrackAdder()}</div>
                <div role="tabpanel" className="tab-pane fade" id="HubAdd">{this.renderCustomHubAdder()}</div>
                </div>
                {
                    this.state.availableTracks.length > 0 &&
                    <FacetTable
                        tracks={this.state.availableTracks}
                        addedTracks={this.props.addedTracks}
                        onTracksAdded={this.props.onTracksAdded}
                    /> 
                }
            </div>
        );
    }
}

export default CustomTrackAdder;
