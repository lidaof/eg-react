import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import RegionSetSelector from '../RegionSetSelector';
import { getTrackConfig } from '../trackConfig/getTrackConfig';
import NavigationContext from '../../model/NavigationContext';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import { NUMERRICAL_TRACK_TYPES } from '../trackManagers/CustomTrackAdder';
import { COLORS } from '../trackVis/commonComponents/MetadataIndicator';
import PlotlyBoxplot from './PlotlyBoxplot';
import { HELP_LINKS } from '../../util';

function mapStateToProps(state) {
    return {
        tracks: state.browser.present.tracks,
        sets: state.browser.present.regionSets,
        selectedSet: state.browser.present.regionSetView,
    };
}

const PLOT_TYPE_DESC = {
    'box': "All genes and genomic intervals are tiled together, genes are always from 5' to 3' end, relative to their strands. Track data of each gene are summarized into fixed length vectors, and median value over each data point is plotted.",
    'line': "One line is plotted for each gene or item, genes are always from 5' to 3', relative to their strands. Track data of each gene and item are summarized into equal length vectors.",
    'heatmap': "Each row is plotted for each gene or item, genes are always from 5' to 3', relative to their strands. Track data of each gene and item are summarized into equal length vectors.",
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
            data: {},
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
            <option value="heatmap">heatmap</option>
          </select>
        </label>
        );
    }

    renderDataPoints = () => {
        return (
            <label>
          data points: {' '}
          <select value={this.state.dataPoints} onChange={this.handleDataPointsChange}>
            <option value="50">50</option>
            <option value="60">60</option>
            <option value="70">70</option>
            <option value="80">80</option>
            <option value="90">90</option>
            <option value="100">100</option>
          </select>
        </label>
        );
    }

    getPlotData = async () => {
        const {setName, trackName, dataPoints, plotType} = this.state;
        if (!setName || !trackName) {
            this.setState({plotMsg: 'Please choose both a set and a track'});
            return;
        }
        this.setState({plotMsg: 'Loading...'});
        const track = this.getTrackByName(trackName);
        const trackConfig = getTrackConfig(track);
        const dataSource = trackConfig.initDataSource();
        const set = this.getSetByName(setName);
        const setRegions = set.features.map(feature => {
            const navContext = new NavigationContext(feature.name, [feature]);
            return new DisplayedRegionModel(navContext);
        });
        const promises = setRegions.map(region => dataSource.getData(region));
        const rawData = await Promise.all(promises);
        const data = rawData.map(raw => trackConfig.formatData(raw));
        const binned = set.features.map((feature,idx) => {
            const step = Math.round((feature.locus.end - feature.locus.start)/dataPoints);
            const lefts = _.range(feature.locus.start, feature.locus.end, step);
            const rights = [...lefts.slice(0,-1).map(x=>x+step), feature.locus.end];
            const bins = _.unzip([lefts,rights]);
            return this.groupDataToBins(data[idx], bins, rights);
        });
        // reverse binned data for feature in - strand
        const adjusted = binned.map( (d, i ) => set.features[i].getIsForwardStrand() ? d.slice() : _.reverse(d.slice()));
        const plotData = _.zip(...adjusted);
        const boxData = plotData.map( (d, i) => ({
            y: d,
            type: 'box',
            name: `${i+1}`,
            marker:{
                color: 'rgb(214,12,140)'
            }
            })
        );
        const lineData  = adjusted.map( (d, i) => ( {
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
        const heatmapData = [{
            x: set.features.map(feature => feature.getName()),
            z: adjusted,
            type: 'heatmap'
        }];
        if (plotType === 'line') {
            this.setState({showlegend: true});
        }
        this.setState({
            data: {
                box: boxData,
                line: lineData,
                heatmap: heatmapData,
            }, 
            plotMsg: ''
        });
    }

    /**
     * @param {NumericalFeature[]} data array of data return from data source, either from bigwig or bedgraph, Todo (methylc)
     * @param bins array of each bin region as [start, end]
     * @param rights array of right side each bin region
     * @return {number[]} array of grouped summarized data
     */
    groupDataToBins = (data, bins, rights) => {
        const indexes = data.map(d => Math.min(_.sortedIndex(rights, d.locus.end), bins.length - 1)); // assures data fall into bins
        let results = Array.from({ length: bins.length }, () => 0);
        data.forEach((d,i) => results[indexes[i]] += (d.locus.getLength() * d.value) );
        return results.map((d,i) => d / (bins[i][1] - bins[i][0]));
    }

    getTrackByName = (name) => {
        return this.props.tracks.find(track => track.name === name);
    }

    getSetByName = (name) => {
        return this.props.sets.find(set => set.name === name);
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

    handleDataPointsChange = (event) => {
        this.setState({dataPoints: Number.parseInt(event.target.value)});
    }

    render(){
        const {sets, genome} = this.props;
        if(sets.length === 0) {
            return <div>
                <p className="alert alert-warning">There is no region set yet, please submit a region set below.</p>
                <RegionSetSelector genome={genome} />
            </div>
        }
        const {data, plotType, showlegend, plotMsg} = this.state;
        return (
            <div>
                <p className="lead">1. Choose a region set</p>
                <div>
                    {this.renderRegionList()}
                </div>
                <p className="lead">2. Choose a <a href={HELP_LINKS.numerical} target="_blank">numerial track</a>:</p>
                <div>
                    {this.renderTrackList()}
                </div>
                <p className="lead">3. Choose a plot type:</p>
                <div>
                    {this.renderPlotTypes()} {this.renderDataPoints()}
                </div>
                <div className="font-italic">{PLOT_TYPE_DESC[plotType]}</div>
                <div>
                    <button onClick={this.getPlotData} className="btn btn-sm btn-success">Plot</button>
                    {' '}
                    {plotMsg}
                </div>
                <div><PlotlyBoxplot data={data[plotType]} showlegend={showlegend} /></div>
            </div>
        );
    }
}

export default connect(mapStateToProps)(Geneplot);