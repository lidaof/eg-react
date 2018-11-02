import React from 'react';
import PropTypes from 'prop-types';
import {Tabs, Tab} from 'react-bootstrap-tabs';
import TrackModel from '../../model/TrackModel';
import CustomHubAdder from './CustomHubAdder';
import FacetTable from './FacetTable';

// Just add a new entry here to support adding a new track type.
// const TRACK_TYPES = ['bigWig', 'bedGraph', 'methylC', 'categorical', 'bed', 'bigBed', 'repeatmasker','refBed', 'hic', 'longrange', 'bigInteract', 'cool', 'bam'];

const TRACK_TYPES = {
    Numerical: ['bigWig', 'bedGraph'],
    Annotation: ['bed', 'bigBed', 'refBed'],
    Categorical: ['categorical'],
    Methylation: ['methylC'],
    Interaction: ['hic','cool','bigInteract','longrange'],
    Repeats: ['repeatmasker'],
    Alignment: ['bam'],

};

const TYPES_DESC = {
    bigWig: 'numerical data', 
    bedGraph: 'numerical data, processed by tabix in .gz format',
    methylC: 'methylation data, processed by tabix in .gz format',
    categorical: 'categorical data, processed by tabix in .gz format',
    bed: 'annotationd data, processed by tabix in .gz format',
    bigBed: 'anotation data',
    repeatmasker: 'repeats annotation data in bigBed format',
    refBed: 'gene annotationd data, processed by tabix in .gz format',
    hic: 'long range interaction data in hic format',
    longrange: 'long range interaction data in longrange format',
    bigInteract: 'long range interaction data in bigInteract format',
    cool: 'long range interaction data in cool format, use data uuid instead of URL',
    bam: 'reads alignment data',
};

/**
 * UI for adding custom tracks.
 * 
 * @author Silas Hsu and Daofeng Li
 */
class CustomTrackAdder extends React.Component {
    static propTypes = {
        addedTracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)),
        customTracksPool: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)),
        onTracksAdded: PropTypes.func,
        onAddTracksToPool: PropTypes.func,
        addTermToMetaSets: PropTypes.func,
        addedTrackSets: PropTypes.instanceOf(Set),
    };

    constructor(props) {
        super(props);
        this.trackUI = null;
        this.state = {
            type: TRACK_TYPES.Numerical[0],
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
        return Object.entries(TRACK_TYPES).map((types) =>
            <optgroup label={types[0]}>
                {
                    types[1].map(type => <option key={type} value={type} >{type} - {TYPES_DESC[type]}</option>)
                }
            </optgroup>
        );
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
                <span style={{marginLeft: "10px", fontStyle: "italic"}}>
                    <a href="https://epigenomegateway.readthedocs.io/en/latest/tracks.html" target="_blank">track format documentation</a>
                </span>
                <select className="form-control" value={type} onChange={event => this.setState({type: event.target.value})} >
                    {this.renderTypeOptions()}
                </select>
            </div>
            <div className="form-group">
                <label>Track file URL</label>
                <input type="text" className="form-control" value={url} onChange={event => this.setState({url: event.target.value})} />
                <span style={{color: "red"}} >{urlError}</span>
            </div>
            <div className="form-group">
                <label>Track label</label>
                <input type="text" className="form-control" value={name} onChange={event => this.setState({name: event.target.value})}/>
            </div>
            {this.renderButtons()}
        </form>
        );
    }

    renderCustomHubAdder() {
        return <CustomHubAdder onTracksAdded={tracks => this.props.onTracksAdded(tracks)} 
                    onAddTracksToPool={tracks => this.props.onAddTracksToPool(tracks, false)}/>;
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
                        addTermToMetaSets={this.props.addTermToMetaSets}
                    /> 
                }
            </div>
        );
    }
}

export default CustomTrackAdder;
