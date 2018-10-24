import React from 'react';
import PropTypes from 'prop-types';
import { RadioGroup, RadioButton } from 'react-radio-buttons';
import _ from 'lodash';
import { scaleLinear } from 'd3-scale';
import Circos, { CHORDS } from '../../react-circos/index';
import TrackModel from '../../model/TrackModel';
import { COLORS } from '../trackVis/commonComponents/MetadataIndicator';
import { HicSource } from '../../dataSources/HicSource';
import LinearDrawingModel from '../../model/LinearDrawingModel';
import ColorPicker from '../ColorPicker';

import './CircletView.css';

const FLANK_LENGTH = 0;

/**
 * a component to draw circlet view for long range tracks
 * @author Daofeng Li
 */

export class CircletView extends React.Component {
    static propTypes = {
        size: PropTypes.number,
        primaryView: PropTypes.object,
        trackData: PropTypes.object,
        track: PropTypes.instanceOf(TrackModel),
        color: PropTypes.string,
        setCircletColor: PropTypes.func,
    };

    static defaultProps = {
        size: 800,
    };

    constructor(props) {
        super(props);
        this.state={
            isLoadingData: true,
            layoutKey: "currentRegion",
            layout: {},
            currentData: [],
            dataKey: "currentRegion",
            data: null,
            scoreMin: 0,
            scoreMax: 0,
            isChecked: false,
        };
        this.scale = null;
    }

    async componentDidMount(){
        const { track, primaryView, trackData} = this.props;
        const layout = this.getLayout();
        const currentData = this.getCurrentData();
        const max2 = _.maxBy(currentData, 'value');
        const min2 = _.minBy(currentData, 'value');
        const max = max2 ? max2.value : 0;
        const min = min2 ? min2.value : 0;
        this.setState( {
            layout,
            currentData,
            scoreMin: min, 
            scoreMax: max,
        });
        if (track.type === 'hic') { // only hic need load additional data
            const dataSource = new HicSource(track.url);
            const data = await dataSource.getDataAll(primaryView.visRegion, {});
            this.setState( {
                isLoadingData: false,
                data: {
                    currentRegion: trackData[track.id].data,
                    currentChromosome: data[0],
                    wholeGenome: data[1],
                }
            });
        } else {
            this.setState({
                isLoadingData: false,
                data: {
                    currentRegion: trackData[track.id].data,
                    currentChromosome: trackData[track.id].data,
                    wholeGenome: trackData[track.id].data,
                }
            });
        }
        
        // for testing
        // this.setState({
        //     isLoadingData: false,
        //     data: {
        //         currentRegion: this.props.trackData[this.props.track.id].data,
        //         currentChromosome: this.props.trackData[this.props.track.id].data,
        //         wholeGenome: this.props.trackData[this.props.track.id].data,
        //     }
        // });
    }

    componentDidUpdate(prevProps, prevState) {
        if(prevState.dataKey !== this.state.dataKey) {
            const data = this.getChords(this.state.layoutKey, this.state.dataKey);
            const max2 = _.maxBy(data, 'value');
            const min2 = _.minBy(data, 'value');
            const max = max2 ? max2.value : 0;
            const min = min2 ? min2.value : 0;
            this.setState({scoreMin: min, scoreMax: max});
        }
    }

    onChangeLayout = (value) => {
        this.setState({layoutKey: value});
    }

    onChangeData = (value) => {
        this.setState({dataKey: value});
    }

    onChangeScoreMin = (event) => {
        this.setState({scoreMin: Number.parseFloat(event.target.value)});
    }

    onChangeScoreMax = (event) => {
        this.setState({scoreMax: Number.parseFloat(event.target.value)});
    }

    handleCheck = () => {
        this.setState({isChecked: !this.state.isChecked});
    }

    getLayout = () => {
        const { primaryView, track, trackData } = this.props;
        const navContext = primaryView.visRegion.getNavigationContext();
        const chrSet = new Set();
        trackData[track.id].data.forEach(item => {
            chrSet.add(item.locus1.chr);
            chrSet.add(item.locus2.chr);
        });
        // in case data is empty, the chrSet will be empty
        primaryView.visRegion.getGenomeIntervals().forEach(chrInterval => chrSet.add(chrInterval.chr));
        const regionSting = primaryView.visRegion.currentRegionAsString();
        const layoutRegion = [
            {
                len: primaryView.visRegion.getWidth(),
                id: 'current',
                label: regionSting,
                color: 'pink'
            }
        ];
        const layoutWhole = [];
        const layoutChrom = []
        navContext.getFeatures().forEach((feature, idx) => {
            const name = feature.getName();
            if(name !== 'chrM') {
                layoutWhole.push(
                    {
                        len: feature.getLength(),
                        id: name,
                        label: name,
                        color: COLORS[idx]
                    }
                );
            }
            if (chrSet.has(name)) {
                layoutChrom.push(
                    {
                        len: feature.getLength(),
                        id: name,
                        label: name,
                        color: COLORS[idx]
                    }
                );
            }
        });
        return {
            currentRegion: layoutRegion,
            currentChromosome: layoutChrom,
            wholeGenome: layoutWhole,
        }
    };

    getCurrentData = () => {
        const { primaryView, track, trackData } = this.props;
        const drawModel = new LinearDrawingModel(primaryView.visRegion, primaryView.visRegion.getWidth());
        const viewRegionBounds = primaryView.visRegion.getContextCoordinates();
        const navContext = primaryView.visRegion.getNavigationContext();
        return trackData[track.id].data.map(item => {
            let contextLocations1 = navContext.convertGenomeIntervalToBases(item.locus1);
            let contextLocations2 = navContext.convertGenomeIntervalToBases(item.locus2);
            contextLocations1 = contextLocations1.map(location => location.getOverlap(viewRegionBounds));
            contextLocations2 = contextLocations2.map(location => location.getOverlap(viewRegionBounds));
            const xSpan1 = drawModel.baseSpanToXSpan(contextLocations1[0]);
            const xSpan2 = drawModel.baseSpanToXSpan(contextLocations2[0]);
            return {
                source: { id: 'current', start: xSpan1.start, end: xSpan1.end},
                target: { id: 'current', start: xSpan2.start, end: xSpan2.end},
                value: item.score
            };
        });
    }

    getChords = (layoutKey, dataKey) => {
        /**
         * the data looks like this:
         * 
        {
            "source": { "id": "chr19", "start": 22186054, "end": 26186054 },
            "target": { "id": "chr17", "start": 31478117, "end": 35478117 }
        },
        */
        const { data, currentData } = this.state;
        if (layoutKey === 'currentRegion' && dataKey === 'currentRegion' ) {
            return currentData;
        }
        const chords = data[dataKey].map(item => {
            return {
                source: { id: item.locus1.chr, start: item.locus1.start - FLANK_LENGTH, end: item.locus1.end + FLANK_LENGTH},
                target: { id: item.locus2.chr, start: item.locus2.start - FLANK_LENGTH, end: item.locus2.end + FLANK_LENGTH},
                value: item.score
            };
        });
        return chords;
    };


    downloadSvg = () => {
        const box = document.querySelector('#circletViewContainer');
        const boxHeight = box.clientHeight || box.offsetHeight;
        const boxWidth = box.clientWidth || box.offsetWidth;
        const xmlns = "http://www.w3.org/2000/svg";
        const svgElem = document.createElementNS (xmlns, "svg");
        svgElem.setAttributeNS (null, "viewBox", "0 0 " + boxWidth + " " + boxHeight);
        svgElem.setAttributeNS (null, "width", boxWidth);
        svgElem.setAttributeNS (null, "height", boxHeight);
        svgElem.style.display = "block";
        let x = 0, y = 0;
        const eleSvg = box.querySelector('svg');
        eleSvg.setAttribute("id", "svgCirclet");
        eleSvg.setAttribute("x", x);
        eleSvg.setAttribute("y", y);
        const eleClone = eleSvg.cloneNode(true);
        svgElem.appendChild(eleClone);
        svgElem.setAttribute("xmlns", xmlns);
        const dl = document.createElement("a");
        document.body.appendChild(dl); // This line makes it work in Firefox.
        const preface = '<?xml version="1.0" standalone="no"?>\r\n';
        const svgBlob = new Blob([preface, new XMLSerializer().serializeToString(svgElem)], {type:"image/svg+xml;charset=utf-8"});
        const svgUrl = URL.createObjectURL(svgBlob);
        dl.setAttribute("href", svgUrl);
        dl.setAttribute("download", (new Date()).toISOString() + "_eg_circlet.svg");
        dl.click();
    }

    drawCircos = (layout, chords, size, color, scale, isChecked) => {
        return <Circos
                    layout={layout}
                    config={{
                    innerRadius: size / 2 - 80,
                    outerRadius: size / 2 - 30,
                    ticks: {
                        display: false,
                    },
                    labels: {
                        position: 'center',
                        display: true,
                        size: 16,
                        color: '#000',
                        radialOffset: 60,
                    },
                    }}
                    tracks={[{
                    type: CHORDS,
                    data: chords,
                    config: {
                        logScale: false,
                        opacity: isChecked ? 1: d => scale(d.value),
                        color,
                        tooltipContent: function (d) {
                            return '<p>' + d.source.id + ' ➤ ' + d.target.id + ': ' + d.value + '</p>'
                        },
                    },
                    }]}
                    size={size}
                />
    }

    render() {
        const { size, color, setCircletColor } = this.props;
        const {layout, layoutKey, dataKey, scoreMin, scoreMax, isChecked} = this.state;
        const layout2 = layout[layoutKey] || [];
        const chords = this.getChords(layoutKey, dataKey) || [];
        console.log(layout2);
        console.log(chords);
        const scale = scaleLinear().domain([scoreMin, scoreMax]).range([0, 1]).clamp(true);
        const chromOption = this.state.isLoadingData ? "Current chromosome (data still downloading)": "Current chromosome";
        const genomeOtion = this.state.isLoadingData ? "Whole genome (data still downloading)": "Whole genome";
        return (
            <div>
            <div className="CircletView-menu">
                <h4>Choose a layout range: </h4>
                <RadioGroup onChange={ this.onChangeLayout } value={this.state.layoutKey} horizontal>
                    <RadioButton value="currentRegion" rootColor="gray" padding={8}>
                        Current region
                    </RadioButton>
                    <RadioButton value="currentChromosome" disabled={this.state.isLoadingData} rootColor="gray" padding={8}>
                        {chromOption}
                    </RadioButton>
                    <RadioButton value="wholeGenome" disabled={this.state.isLoadingData} rootColor="gray" padding={8}>
                        {genomeOtion}
                    </RadioButton>
                </RadioGroup>
                <h4>Choose data from: </h4>
                <RadioGroup onChange={ this.onChangeData } value={this.state.dataKey} horizontal> 
                    <RadioButton value="currentRegion" rootColor="gray" padding={8}>
                        Current region
                    </RadioButton>
                    <RadioButton value="currentChromosome" disabled={this.state.isLoadingData} rootColor="gray" padding={8}>
                        {chromOption}
                    </RadioButton>
                    <RadioButton value="wholeGenome" disabled={this.state.isLoadingData} rootColor="gray" padding={8}>
                        {genomeOtion}
                    </RadioButton>
                </RadioGroup>
                <div className="CircletView-config">
                    <div>
                        Change color: <ColorPicker color={color} label="" onChange={color => setCircletColor(color.hex)} />
                    </div>
                    <div>
                        <div>Change score scale: </div>
                        <label>
                            Min: <input type="text" value={scoreMin} size={10} onChange={this.onChangeScoreMin} />
                        </label> <label>
                            Max: <input type="text" value={scoreMax} size={10} onChange={this.onChangeScoreMax} />
                        </label>
                    </div>
                    <div>
                        <label htmlFor="turnOffScale">Turn off scale </label> <input 
                            onChange={this.handleCheck} id="turnOffScale" type="checkbox" checked={isChecked}/>
                    </div>
                    <div>
                        <button 
                        className="btn btn-success btn-sm" 
                        onClick={this.downloadSvg} 
                        >⬇ Download</button>
                    </div>
                </div>
            </div>
            <div className="CircletView-container" id="circletViewContainer">
                {this.drawCircos(layout2, chords, size, color, scale, isChecked)}
            </div>
            </div>
        );
    }
}