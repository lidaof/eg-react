import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import { scaleLinear } from 'd3-scale';

import { RadioGroup, RadioButton } from 'react-radio-buttons';
import Circos, { CHORDS } from '../../react-circos/index';

import TrackModel from '../../model/TrackModel';
import LinearDrawingModel from '../../model/LinearDrawingModel';
import { HicSource } from '../../dataSources/HicSource';
import withCurrentGenome from '../withCurrentGenome';

import ColorPicker from '../ColorPicker';
import { COLORS } from '../trackVis/commonComponents/MetadataIndicator';

import './CircletView.css';

const DRAW_LIMIT = 5000;

/**
 * a component to draw circlet view for long range tracks
 * @author Daofeng Li
 */
class CircletViewNoGenome extends React.Component {
    static propTypes = {
        size: PropTypes.number,
        primaryView: PropTypes.object,
        trackData: PropTypes.object,
        track: PropTypes.instanceOf(TrackModel),
        color: PropTypes.string,
        setCircletColor: PropTypes.func,
        genomeConfig: PropTypes.object.isRequired
    };

    static defaultProps = {
        size: 800,
    };

    constructor(props) {
        super(props);
        this.state= {
            isLoadingData: true,
            layoutKey: "currentRegion",
            layout: {},
            currentData: [],
            dataKey: "currentRegion",
            data: null,
            scoreMin: 0,
            scoreMax: 0,
            isChecked: false,
            flanking: 0,
        };
        if (props.track.type === 'hic') {
            this.hicSource = new HicSource(props.track.url);
        }
        this.scale = null;
        this.getChords = memoizeOne(this.getChords);
    }

    async componentDidMount(){
        const { track, primaryView, trackData, genomeConfig } = this.props;
        const layout = this.getLayout();
        const currentData = this.getCurrentData();
        const max2 = _.maxBy(currentData, 'value');
        const min2 = _.minBy(currentData, 'value');
        const max = max2 ? max2.value : 0;
        const min = min2 ? min2.value : 0;
        this.setState({
            layout,
            currentData,
            scoreMin: min,
            scoreMax: max,
        });

        if (track.type === 'hic') { // only hic need load additional data
            const interactions = await this.hicSource.getDataAll(genomeConfig.navContext);
            const currentChromosomes = new Set(
                primaryView.viewWindowRegion.getGenomeIntervals().map(locus => locus.chr)
            );
            const dataInView = interactions.filter(interaction =>
                currentChromosomes.has(interaction.locus1.chr) && currentChromosomes.has(interaction.locus2.chr)
            );
            this.setState({
                isLoadingData: false,
                data: {
                    currentRegion: trackData[track.id].data,
                    currentChromosome: dataInView,
                    wholeGenome: interactions,
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

    onChangeFlanking = (event) => {
        this.setState({flanking: Number.parseInt(event.target.value, 10)});
    }

    handleCheck = () => {
        this.setState({isChecked: !this.state.isChecked});
    }

    getLayout = () => {
        const { primaryView, track, trackData, genomeConfig } = this.props;
        const navContext = genomeConfig.navContext;
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
        const currentData = [];
        trackData[track.id].data.forEach(item => {
            let contextLocations1 = navContext.convertGenomeIntervalToBases(item.locus1);
            let contextLocations2 = navContext.convertGenomeIntervalToBases(item.locus2);
            contextLocations1 = contextLocations1.map(location => location.getOverlap(viewRegionBounds));
            contextLocations2 = contextLocations2.map(location => location.getOverlap(viewRegionBounds));
            // when other end out side of range will return null
            if(contextLocations1.length > 0 && contextLocations1[0] !== null &&
                contextLocations2.length > 0 && contextLocations2[0] !== null) {
                const xSpan1 = drawModel.baseSpanToXSpan(contextLocations1[0]);
                const xSpan2 = drawModel.baseSpanToXSpan(contextLocations2[0]);
                currentData.push({
                    source: { id: 'current', start: xSpan1.start, end: xSpan1.end},
                    target: { id: 'current', start: xSpan2.start, end: xSpan2.end},
                    value: item.score
                });
            }
        });
        return currentData;
        // TODO: repalce block above with use of FeaturePlacer
        // const featurePlacer = new FeaturePlacer();
        // const placements = featurePlacer.placeInteractions(interactions, viewRegion, width);
        // return placements.map(placement => {
        //     return {
        //         souce: {id: 'current', start: placement.xSpan1.start, end: placement.xSpan1.end },
        //         target: {id: 'current', start: placement.xSpan2.start, end: placement.xSpan2.end },
        //         value: placement.interaction.score
        //     };
        // }
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
        const { data, currentData, flanking } = this.state;
        if (layoutKey === 'currentRegion' && dataKey === 'currentRegion' ) {
            return currentData;
        }
        const chords = data[dataKey].map(item => {
            return {
                source: { id: item.locus1.chr, start: item.locus1.start - flanking, end: item.locus1.end + flanking},
                target: { id: item.locus2.chr, start: item.locus2.start - flanking, end: item.locus2.end + flanking},
                value: item.score
            };
        });
        chords.sort((a, b) => b.value - a.value);
        return chords.slice(0, DRAW_LIMIT); // Only the DRAW_LIMIT highest scores
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
        const {layout, layoutKey, dataKey, scoreMin, scoreMax, isChecked, flanking} = this.state;
        const layout2 = layout[layoutKey] || [];
        const chords = this.getChords(layoutKey, dataKey) || [];
        const scale = scaleLinear().domain([scoreMin, scoreMax]).range([0, 1]).clamp(true);
        const chromOption = this.state.isLoadingData ? "Current chromosome (data still downloading)": "Current chromosome";
        const genomeOtion = this.state.isLoadingData ? "Whole genome (data still downloading)": "Whole genome";
        return (
            <div>
            <div className="CircletView-menu">
                <h5>Choose a layout range: </h5>
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
                <h5>Choose data from: (please note only .hic track will fetch additional data)</h5>
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
                        <div>Change flanking at each side: </div>
                        <label>
                            Length: <input type="number" value={flanking} step={10000} size={10} onChange={this.onChangeFlanking} />bp
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

export const CircletView = withCurrentGenome(CircletViewNoGenome);
