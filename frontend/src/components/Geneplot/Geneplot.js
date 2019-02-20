import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import RegionSetSelector from '../RegionSetSelector';
import NavigationContext from '../../model/NavigationContext';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import WorkerSource from '../../dataSources/worker/WorkerSource';
import { BigWorker } from '../../dataSources/WorkerTSHook';
import LocalBedSource from '../../dataSources/LocalBedSource';
import LocalBigSource from '../../dataSources/big/LocalBigSource';
import { BedWorker } from '../../dataSources/WorkerTSHook';
import { NUMERRICAL_TRACK_TYPES } from '../trackManagers/CustomTrackAdder';
import { COLORS } from '../trackVis/commonComponents/MetadataIndicator';
import PlotlyBoxplot from './PlotlyBoxplot';

function mapStateToProps(state) {
    return {
        tracks: state.browser.present.tracks,
        sets: state.browser.present.regionSets,
        selectedSet: state.browser.present.regionSetView,
    };
}

const PLOT_TYPE_DESC = {
    'box': "All genes and genomic intervals are tiled together, genes are always from 5' to 3' end, relative to their strands. Track data of each gene are summarized into fixed length vectors, and median value over each data point is plotted.",
    'line': "One line is plotted for each gene or item, genes are always from 5' to 3', relative to their strands. Track data of each gene and item are summarized into equal length vectors."
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
            dataPoints: 50,
            data: [],
            showlegend: false,
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

    renderPlotTypes = () => {
        return (
            <label>
          Pick your plot type: {' '}
          <select value={this.state.plotType} onChange={this.handlePlotTypeChange}>
            <option value="box">box</option>
            <option value="line">line</option>
          </select>
        </label>
        );
    }

    renderPlot = async () => {
        const {setName, trackName, dataPoints, plotType} = this.state;
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
        const binned = set.features.map((feature,idx) => {
            const step = Math.ceil((feature.locus.end - feature.locus.start)/dataPoints);
            const lefts = _.range(feature.locus.start, feature.locus.end, step);
            const rights = [...lefts.slice(0,-1).map(x=>x+step), feature.locus.end];
            const bins = _.unzip([lefts,rights]);
            return this.groupDataToBins(data[idx], bins, rights);
        });
        const plotData = _.zip(...binned);
        let plotlyData;
        if(plotType === 'box'){
            plotlyData = plotData.map( (d, i) => ({
                y: d,
                type: 'box',
                name: `${i+1}`,
                marker:{
                  color: 'rgb(214,12,140)'
                }
              })
            );
        } else {
            plotlyData = binned.map( (d, i) => ( {
                type: 'scatter',
                x: _.range(1, d.length+1),
                y: d,
                mode: 'lines',
                name: set.features[i].name,
                line: {
                    dash: 'solid',
                    width: 2,
                    color: COLORS[i],
                }
            }));
            this.setState({showlegend: true});
        }
        this.setState({data: plotlyData, plotMsg: ''});
    }

    /**
     * @param data array of data return from data source, either from bigwig or bedgraph, Todo (methylc)
     * @param bins array of each bin region as [start, end]
     * @param rights array of right side each bin region
     * @return {number[]} array of grouped summarized data
     */

    groupDataToBins = (data, bins, rights) => {
        const indexes = data.map(d => Math.min(_.sortedIndex(rights, d.max), bins.length - 1)); // assures data fall into bins
        let results = Array.from({ length: bins.length }, () => 0);
        data.forEach((d,i) => results[indexes[i]] += (d.max - d.min) * d.score);
        return results.map((d,i) => d / (bins[i][1] - bins[i][0]));
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

    handlePlotTypeChange = (event) => {
        this.setState({plotType: event.target.value});
    }

    render(){
        const {sets, genome} = this.props;
        if(sets.length === 0) {
            return <div>
                <p class="alert alert-warning">There is no region set yet, please submit a region set below.</p>
                <RegionSetSelector genome={genome} />
            </div>
        }
        return (
            <div>
                <p className="lead">1. Choose a region set</p>
                {this.renderRegionList()}
                <p className="lead">2. Choose a <a href="https://eg.readthedocs.io/en/latest/tracks.html#numerical-tracks" target="_blank">numerial track</a>:</p>
                {this.renderTrackList()}
                <p className="lead">3. Choose a plot type:</p>
                {this.renderPlotTypes()}
                <div className="font-italic">{PLOT_TYPE_DESC[this.state.plotType]}</div>
                <button onClick={this.renderPlot} className="btn btn-sm btn-success">Plot</button>
                <div>{this.state.plotMsg}</div>
                <div><PlotlyBoxplot data={this.state.data} showlegend={this.state.showlegend} /></div>
            </div>
        );
    }
}

export default connect(mapStateToProps)(Geneplot);