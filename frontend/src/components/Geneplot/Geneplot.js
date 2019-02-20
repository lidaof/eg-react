import React from 'react';
import { connect } from 'react-redux';
import RegionSetSelector from '../RegionSetSelector';
import NavigationContext from '../../model/NavigationContext';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import WorkerSource from '../../dataSources/worker/WorkerSource';
import { BigWorker } from '../../dataSources/WorkerTSHook';
import LocalBedSource from '../../dataSources/LocalBedSource';
import LocalBigSource from '../../dataSources/big/LocalBigSource';
import { BedWorker } from '../../dataSources/WorkerTSHook';
import { NUMERRICAL_TRACK_TYPES } from '../trackManagers/CustomTrackAdder';

function mapStateToProps(state) {
    return {
        tracks: state.browser.present.tracks,
        sets: state.browser.present.regionSets,
        selectedSet: state.browser.present.regionSetView,
    };
}

/**
 * The component for gene plot
 * @author Daofeng Li
 */
class Geneplot extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            setName: '',
            trackName: '',
            plotType: 'box',
            plotMsg: '',
        };
    }

    renderRegionList = () => {
        const setList = this.props.sets.map((item,index) => <option key={index} value={item.name}>{item.name}</option>)
        return (
            <label>
          Pick your set: {' '}
          <select value={this.state.setName} onChange={this.handleSetChange}>
            <option key={0} value="">--</option>
            {setList}
          </select>
        </label>
        );
    }

    renderTrackList = () => {
        const trackList = this.props.tracks
            .filter(item => NUMERRICAL_TRACK_TYPES.includes(item.type))
            .map((item,index) => <option key={index} value={item.name}>{item.label}</option>)
        return (
            <label>
          Pick your track: {' '}
          <select value={this.state.trackName} onChange={this.handleTrackChange}>
            <option key={0} value="">--</option>
            {trackList}
          </select>
        </label>
        );
    }

    renderPlot = async () => {
        const {setName, trackName} = this.state;
        if (!setName || !trackName) {
            this.setState({plotMsg: 'Please choose both a set and a track'});
            return;
        }
        this.setState({plotMsg: 'Loading...'});
        const track = this.getTrackByName(trackName);
        const set = this.getSetByName(setName);
        const dataSource = this.getDataSource(track);
        const setRegions = set.features.map(feature => {
            const navContext = new NavigationContext(feature.name, [feature]);
            return new DisplayedRegionModel(navContext);
        });
        const promises = setRegions.map(region => dataSource.getData(region));
        const data = await Promise.all(promises);
        console.log(data);
    }

    getTrackByName = (name) => {
        return this.props.tracks.find(track => track.name === name);
    }

    getSetByName = (name) => {
        return this.props.sets.find(set => set.name === name);
    }

    getDataSource = (track) => {
        if (track.type === 'bigwig') {
            if (track.fileObj) {
                return new LocalBigSource(track.fileObj);
            } else {
                return new WorkerSource(BigWorker, track.url);
            }
        } else {
            if (track.files.length > 0) {
                return new LocalBedSource(track.files);
            } else {
                return new WorkerSource(BedWorker, track.url);
            }
        }
    }

    handleSetChange = (event) => {
        this.setState({setName: event.target.value});
    }

    handleTrackChange = (event) => {
        this.setState({trackName: event.target.value});
    }

    render(){
        const {sets, genome} = this.props;
        if(sets.length === 0) {
            return <div>
                <p>There is no region set yet, please submit a region set below.</p>
                <RegionSetSelector genome={genome} />
            </div>
        }
        return (
            <div>
                <p>1. Choose a region set</p>
                {this.renderRegionList()}
                <p>2. Choose a <a href="https://eg.readthedocs.io/en/latest/tracks.html#numerical-tracks" target="_blank">numerial track</a>:</p>
                {this.renderTrackList()}
                <p>3. Choose a plot type:</p>
                <button onClick={this.renderPlot}>Plot</button>
                <div>{this.state.plotMsg}</div>
            </div>
        );
    }
}

export default connect(mapStateToProps)(Geneplot);