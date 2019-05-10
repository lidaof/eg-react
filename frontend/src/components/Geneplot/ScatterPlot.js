import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import RegionSetSelector from '../RegionSetSelector';
import { getTrackConfig } from '../trackConfig/getTrackConfig';
import NavigationContext from '../../model/NavigationContext';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import { NUMERRICAL_TRACK_TYPES } from '../trackManagers/CustomTrackAdder';
import { HELP_LINKS, pcorr } from '../../util';
import ColorPicker from '../ColorPicker';

const Plot = createPlotlyComponent.default(Plotly);

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
            markerColor: 'blue',
            markerSize: 12,
        };
        this.changeMarkerColor = _.debounce(this.changeMarkerColor.bind(this), 250);
        this.changeMarkerSize = _.debounce(this.changeMarkerSize.bind(this), 250);
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
        const {setName, trackNameX, trackNameY, markerColor, markerSize} = this.state;
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
        const pcor = pcorr(dataX, dataY);
        const layout = {
            width: 900, height: 600,
            xaxis: {
                title: {
                  text: trackNameX,
                  font: {
                    family: 'Helvetica, Courier New, monospace',
                    size: 12,
                    color: trackX.options ? trackX.options.color : 'blue'
                  }
                },
              },
              yaxis: {
                title: {
                  text: trackNameY,
                  font: {
                    family: 'Helvetica, Courier New, monospace',
                    size: 12,
                    color: trackY.options ? trackY.options.color : 'blue'
                  }
                }
              },
              annotations: [{
                xref: 'paper',
                yref: 'paper',
                x: 0.7,
                xanchor: 'right',
                y: 1,
                yanchor: 'bottom',
                text: `R = ${pcor.toFixed(4)}`,
                showarrow: false,
                font: {
                    family: 'Helvetica, Courier New, monospace',
                    size: 16,
                    color: markerColor
                  },
              }]
        };
        this.setState({
            data: {
                x: dataX,
                y: dataY,
                mode: 'markers',
                type: 'scatter',
                name: setName,
                text: featureNames,
                marker: { size: markerSize, color: markerColor }
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

    changeMarkerColor = (color) => {
        const { data } = this.state;
        const marker = {...data.marker, color: color.hex};
        const updatedData = {...data, marker};
        this.setState( {markerColor: color.hex, data: updatedData});
    }

    renderMarkerColorPicker = () => {
        return <ColorPicker color={this.state.markerColor} label="Marker color" onChange={this.changeMarkerColor} />;
    }

    changeMarkerSize = (size) => { // debounce this one
        const { data } = this.state;
        const marker = {...data.marker, size};
        const updatedData = {...data, marker};
        this.setState( {markerSize: size, data: updatedData});
    }

    handleMarkerChangeRequest = (e) => { // don't debounce this, it will cause the warning
        this.changeMarkerSize(Number.parseInt(e.target.value) || 1)
    }

    renderMarkerSizeInput = () => {
        const {markerSize} = this.state;
        return <label> Marker size: {' '}
            <input type="number" id="markerSize" step="1" min="1" max="100" 
                                value={markerSize}
                                onChange={this.handleMarkerChangeRequest} />
        </label>;
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
        const config = {
            toImageButtonOptions: {
              format: 'svg', // one of png, svg, jpeg, webp
              filename: 'scatter_plot',
              height: 600,
              width: 900,
              scale: 1, // Multiply title/legend/axis/canvas sizes by this factor
            },
            displaylogo: false,
            responsive: true,
            modeBarButtonsToRemove: ['select2d', 'lasso2d', 'toggleSpikelines'],
          };
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
                <p className="lead">4. Plot configuration:</p>
                <div>
                    {this.renderMarkerColorPicker()}
                    {this.renderMarkerSizeInput()}
                </div>
                <div>
                    <button onClick={this.getScatterPlotData} className="btn btn-sm btn-success">Plot</button>
                    {' '}
                    {plotMsg}
                </div>
                <div><Plot data={[data]} layout={layout} config={config} /></div>
            </div>
        );
    }
}

export default connect(mapStateToProps)(ScatterPlot);
