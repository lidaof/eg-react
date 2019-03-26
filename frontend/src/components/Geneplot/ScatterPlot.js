import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import RegionSetSelector from '../RegionSetSelector';
import { getTrackConfig } from '../trackConfig/getTrackConfig';
import NavigationContext from '../../model/NavigationContext';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import { NUMERRICAL_TRACK_TYPES } from '../trackManagers/CustomTrackAdder';
import PlotlyPlot from './PlotlyPlot';
import { HELP_LINKS } from '../../util';


function mapStateToProps(state) {
    return {
        tracks: state.browser.present.tracks,
        sets: state.browser.present.regionSets,
        selectedSet: state.browser.present.regionSetView,
    };
}

/**
 * The component for scatter plot
 * @author Daofeng Li
 */
class ScatterPlot extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            setName: '',
            trackNameX: '',
            trackNameY: '',
            plotMsg: '',
            data: {},
            layout: {},
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

    renderTrackXList = () => {
        const trackList = this.props.tracks
            .filter(item => NUMERRICAL_TRACK_TYPES.includes(item.type))
            .map((item,index) => <option key={index} value={item.name}>{item.label}</option>)
        return (
            <label>
          Pick your track: {' '}
          <select value={this.state.trackNameX} onChange={this.handleTrackXChange}>
            <option key={0} value="">--</option>
            {trackList}
          </select>
        </label>
        );
    }

    renderTrackYList = () => {
        const trackList = this.props.tracks
            .filter(item => NUMERRICAL_TRACK_TYPES.includes(item.type))
            .map((item,index) => <option key={index} value={item.name}>{item.label}</option>)
        return (
            <label>
          Pick your track: {' '}
          <select value={this.state.trackNameY} onChange={this.handleTrackYChange}>
            <option key={0} value="">--</option>
            {trackList}
          </select>
        </label>
        );
    }

    getScatterPlotData = async () => {
        const {setName, trackNameX, trackNameY} = this.state;
        if (!setName || !trackNameX || !trackNameY) {
            this.setState({plotMsg: 'Please choose both a set and 2 tracks'});
            return;
        }
        this.setState({plotMsg: 'Loading...'});
        const trackX = this.getTrackByName(trackNameX);
        const trackY = this.getTrackByName(trackNameY);
        const trackConfigX = getTrackConfig(trackX);
        const dataSourceX = trackConfigX.initDataSource();
        const trackConfigY = getTrackConfig(trackY);
        const dataSourceY = trackConfigY.initDataSource();
        const set = this.getSetByName(setName);
        const flankedFeatures = set.features.map(feature => set.flankingStrategy.makeFlankedFeature(feature, set.genome));
        const setRegions = flankedFeatures.map(feature => {
            const navContext = new NavigationContext(feature.name, [feature]);
            return new DisplayedRegionModel(navContext);
        });
        const promisesX = setRegions.map(region => dataSourceX.getData(region));
        const rawDataX = await Promise.all(promisesX);
        const dataXall = rawDataX.map(raw => trackConfigX.formatData(raw));
        const dataX = dataXall.map(all => _.meanBy(all, 'value'))
        const promisesY = setRegions.map(region => dataSourceY.getData(region));
        const rawDataY = await Promise.all(promisesY);
        const dataYall = rawDataY.map(raw => trackConfigY.formatData(raw));
        const dataY = dataYall.map(all => _.meanBy(all, 'value'))
        const featureNames = flankedFeatures.map(feature => feature.getName());
        const layout = {
            width: 900, height: 600,
            xaxis: {
                title: {
                  text: trackNameX,
                  font: {
                    family: 'Courier New, monospace',
                    size: 12,
                    color: trackX.options ? trackX.options.color : 'blue'
                  }
                },
              },
              yaxis: {
                title: {
                  text: trackNameY,
                  font: {
                    family: 'Courier New, monospace',
                    size: 12,
                    color: trackY.options ? trackY.options.color : 'blue'
                  }
                }
              }
        };
        this.setState({
            data: {
                x: dataX,
                y: dataY,
                mode: 'markers',
                type: 'scatter',
                name: setName,
                text: featureNames,
                marker: { size: 12 }
            }, 
            plotMsg: '',
            layout,
        });
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
    
    handleTrackXChange = (event) => {
        this.setState({trackNameX: event.target.value});
    }

    handleTrackYChange = (event) => {
        this.setState({trackNameY: event.target.value});
    }

    render(){
        const {sets, genome} = this.props;
        if(sets.length === 0) {
            return <div>
                <p className="alert alert-warning">There is no region set yet, please submit a region set below.</p>
                <RegionSetSelector genome={genome} />
            </div>
        }
        const {data, plotMsg, layout} = this.state;
        return (
            <div>
                <p className="lead">1. Choose a region set</p>
                <div>
                    {this.renderRegionList()}
                </div>
                <p className="lead">2. Choose a <a href={HELP_LINKS.numerical} target="_blank">numerial track</a> for X-axis:</p>
                <div>
                    {this.renderTrackXList()}
                </div>
                <p className="lead">3. Choose a numerial track for Y-axis:</p>
                <div>
                    {this.renderTrackYList()}
                </div>
                
                <div>
                    <button onClick={this.getScatterPlotData} className="btn btn-sm btn-success">Plot</button>
                    {' '}
                    {plotMsg}
                </div>
                <div><PlotlyPlot data={[data]} layout={layout}/></div>
            </div>
        );
    }
}

export default connect(mapStateToProps)(ScatterPlot);
