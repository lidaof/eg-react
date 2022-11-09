import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import RegionSetSelector from '../RegionSetSelector';
import { getTrackConfig } from '../trackConfig/getTrackConfig';
import NavigationContext from '../../model/NavigationContext';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import { NUMERRICAL_TRACK_TYPES } from '../trackManagers/CustomTrackAdder';
import { COLORS } from '../trackVis/commonComponents/MetadataIndicator';
import { HELP_LINKS } from '../../util';
import ColorPicker from '../ColorPicker';

const Plot = window.createPlotlyComponent.default(window.Plotly);

function mapStateToProps(state) {
    const present = state.browser.present;
    const [cidx, gidx] = present.editTarget;
    return {
        tracks: present.containers[cidx].genomes[gidx].tracks,
        sets: present.containers[cidx].genomes[gidx].regionSets,
        selectedSet: present.containers[cidx].genomes[gidx].regionSetView,
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
            boxColor: 'rgb(214,12,140)',
        };
        this.changeBoxColor = _.debounce(this.changeBoxColor.bind(this), 250);
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
        const {setName, trackName, dataPoints, boxColor} = this.state;
        if (!setName || !trackName) {
            this.setState({plotMsg: 'Please choose both a set and a track'});
            return;
        }
        this.setState({plotMsg: 'Loading...'});
        const track = this.getTrackByName(trackName);
        const trackConfig = getTrackConfig(track);
        const dataSource = trackConfig.initDataSource();
        const set = this.getSetByName(setName);
        const flankedFeatures = set.features.map(feature => set.flankingStrategy.makeFlankedFeature(feature, set.genome));
        const setRegions = flankedFeatures.map(feature => {
            const navContext = new NavigationContext(feature.name, [feature]);
            return new DisplayedRegionModel(navContext);
        });
        const promises = setRegions.map(region => dataSource.getData(region));
        const rawData = await Promise.all(promises);
        const data = rawData.map(raw => trackConfig.formatData(raw));
        const binned = flankedFeatures.map((feature,idx) => {
            const step = Math.round((feature.locus.end - feature.locus.start)/dataPoints);
            const lefts = _.range(feature.locus.start, feature.locus.end - step/2, step); // to avoid last tiny bin
            const rights = [...(lefts.slice(0, -1).map(x=>x+step)), feature.locus.end];
            const bins = _.unzip([lefts,rights]);
            return this.groupDataToBins(data[idx], bins, rights);
        });
        // reverse binned data for feature in - strand
        const adjusted = binned.map( (d, i ) => flankedFeatures[i].getIsForwardStrand() ? d.slice() : _.reverse(d.slice()));
        // console.log(adjusted);
        const featureNames = flankedFeatures.map(feature => feature.getName());
        // console.log(featureNames);
        const plotData = _.zip(...adjusted);
        const boxData = plotData.map( (d, i) => ({
            y: d,
            type: 'box',
            name: `${i+1}`,
            marker:{
                color: boxColor
            }
            })
        );
        const lineData  = adjusted.map( (d, i) => ( {
            type: 'scatter',
            x: _.range(1, d.length+1),
            y: d,
            mode: 'lines',
            name: featureNames[i],
            line: {
                dash: 'solid',
                width: 2,
                color: COLORS[i],
            }
        }));
        const heatmapData = [{
            z: adjusted,
            x: _.range(1, adjusted[0].length+1),
            y: featureNames,
            type: 'heatmap'
        }];
        // console.log(heatmapData);
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
        // return the area of region
        let results = Array.from({ length: bins.length }, () => 0);
        data.forEach((d,i) => results[indexes[i]] += (d.locus.getLength() * d.value) );
        return results.map((d,i) => d / (bins[i][1] - bins[i][0]));
        // simple mean of data in region
        // let results = Array.from({ length: bins.length }, () => []);
        // data.forEach((d,i) => results[indexes[i]].push(d.value) );
        // return results.map(d => _.mean(d));
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
        this.setState({plotType: event.target.value, showlegend: event.target.value === 'line'});
    }

    handleDataPointsChange = (event) => {
        this.setState({dataPoints: Number.parseInt(event.target.value)});
    }

    changeBoxColor = (color) => {
        const { data } = this.state;
        const boxData = data.box.map( d => ({...d, marker: {color: color.hex} }));
        const updatedData = {...data, box: boxData};
        this.setState( {boxColor: color.hex, data: updatedData});
    }

    renderBoxColorPicker = () => {
        return <ColorPicker color={this.state.boxColor} label="box color" onChange={this.changeBoxColor} />;
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
        // let heatmapData = null;
        // if (plotType === 'heatmap') {
        //     heatmapData = formatForHeatmap(data);
        // }
        const layout = {
            width: 900, height: 600, showlegend,
            margin: {
              l: 180
            },
          };
        const config = {
            toImageButtonOptions: {
              format: 'svg', // one of png, svg, jpeg, webp
              filename: 'gene_plot',
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
                <p className="lead">2. Choose a <a href={HELP_LINKS.numerical} target="_blank" rel="noopener noreferrer">numerial track</a>:</p>
                <div>
                    {this.renderTrackList()}
                </div>
                <p className="lead">3. Choose a plot type:</p>
                <div>
                    {this.renderPlotTypes()} {this.renderDataPoints()} {plotType === 'box' && this.renderBoxColorPicker()}
                </div>
                <div className="font-italic">{PLOT_TYPE_DESC[plotType]}</div>
                <div>
                    <button onClick={this.getPlotData} className="btn btn-sm btn-success">Plot</button>
                    {' '}
                    {plotMsg}
                </div>
                <div><Plot data={data[plotType]} layout={layout} config={config} /></div>
                {/* {(plotType !== 'heatmap')?
                <div><PlotlyPlot data={data[plotType]} showlegend={showlegend} /></div>
                : (heatmapData) ? <HeatmapWidget data={heatmapData}/> : null
                } */}
            </div>
        );
    }
}

export default connect(mapStateToProps)(Geneplot);
