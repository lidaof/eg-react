import React from 'react';
import PropTypes from 'prop-types';
import {Tabs, Tab} from 'react-bootstrap-tabs';
import TrackModel from '../../model/TrackModel';
import CustomHubAdder from './CustomHubAdder';
import FacetTable from './FacetTable';

// Just add a new entry here to support adding a new track type.
const TRACK_TYPES = ['bigWig', 'bedGraph', 'bed', 'bigBed', 'hic', 'bam'];

const TYPES_DESC = [
        'numerical data', 
        'numerical data, processed by tabix in .gz format',
        'annotationd data, processed by tabix in .gz format',
        'anotation data',
        'long range interaction data',
        'reads alignment data'
    ];

/**
 * UI for adding custom tracks.
 * 
 * @author Silas Hsu
 */
class CustomTrackAdder extends React.Component {
    static propTypes = {
        addedTracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)),
        customTracksPool: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)),
        onTracksAdded: PropTypes.func,
        onAddTracksToPool: PropTypes.func,
        addedTrackSets: PropTypes.instanceOf(Set),
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
            selectedTabIndex: 0,
        };
        this.handleSubmitClick = this.handleSubmitClick.bind(this);
    }

    handleSubmitClick() {
        if (!this.props.onTracksAdded) {
            return;
        }

        if (!this.state.url) {
            this.setState({urlError: "Enter a URL"});
        } else {
            const newTrack = new TrackModel({...this.state, datahub: 'Custom track'});
            this.props.onTracksAdded([newTrack]);
            this.props.onAddTracksToPool([newTrack], false);
            this.setState({urlError: "", trackAdded: true});
        }
    }

    renderTypeOptions() {
        return TRACK_TYPES.map((type,i) => <option key={type} value={type} >{type} - {TYPES_DESC[i]}</option>);
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
        return <CustomHubAdder onTracksAdded={tracks => this.props.onAddTracksToPool(tracks, false)} />;
    }

    render() {
        return (
            <div id="CustomTrackAdder">	  
                <div>
                    <Tabs onSelect={(index, label) => this.setState({selectedTabIndex: index})} 
                        selected={this.state.selectedTabIndex}
                        headerStyle={{fontWeight: 'bold'}} activeHeaderStyle={{color: 'blue'}}
                    >
                        <Tab label="Add Custom Track">{this.renderCustomTrackAdder()}</Tab>
                        <Tab label="Add Custom Data Hub">{this.renderCustomHubAdder()}</Tab>
                    </Tabs>
                </div>   
                {
                    this.props.customTracksPool.length > 0 &&
                    <FacetTable
                        tracks={this.props.customTracksPool}
                        addedTracks={this.props.addedTracks}
                        onTracksAdded={this.props.onTracksAdded}
                        addedTrackSets={this.props.addedTrackSets}
                    /> 
                }
            </div>
        );
    }
}

export default CustomTrackAdder;
