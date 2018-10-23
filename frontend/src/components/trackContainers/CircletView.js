import React from 'react';
import PropTypes from 'prop-types';
import { RadioGroup, RadioButton } from 'react-radio-buttons';
import Circos, { CHORDS } from '../../react-circos/index';
import TrackModel from '../../model/TrackModel';
import { COLORS } from '../trackVis/commonComponents/MetadataIndicator';
import { HicSource } from '../../dataSources/HicSource';
import LinearDrawingModel from '../../model/LinearDrawingModel';

import './CircletView.css';

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
    };

    static defaultProps = {
        size: 800
    };

    constructor(props) {
        super(props);
        this.state={
            isLoadingData: true,
            layoutKey: "currentRegion",
            dataKey: "currentRegion",
            data: null,
        };
    }

    async componentDidMount(){
        const dataSource = new HicSource(this.props.track.url);
        const data = await dataSource.getDataAll(this.props.primaryView.visRegion, {});
        this.setState( {
            isLoadingData: false,
            data: {
                currentRegion: this.props.trackData[this.props.track.id].data,
                currentChromosome: data[0],
                wholeGenome: data[1],
            }
        })
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

    onChangeLayout = (value) => {
        this.setState({layoutKey: value});
    }

    onChangeData = (value) => {
        this.setState({dataKey: value});
    }

    getLayout = () => {
        const { primaryView, track, trackData } = this.props;
        const navContext = primaryView.visRegion.getNavigationContext();
        const chrSet = new Set();
        trackData[track.id].data.forEach(item => {
            chrSet.add(item.locus1.chr);
            chrSet.add(item.locus2.chr);
        })
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

    getChords = (layoutKey, dataKey) => {
        /**
         * the data looks like this:
         * 
        {
            "source": { "id": "chr19", "start": 22186054, "end": 26186054 },
            "target": { "id": "chr17", "start": 31478117, "end": 35478117 }
        },
        */
        const { primaryView, track, trackData } = this.props;
        const { data } = this.state;
        if (layoutKey === 'currentRegion' && dataKey === 'currentRegion' ) {
            const drawModel = new LinearDrawingModel(primaryView.visRegion, primaryView.visRegion.getWidth());
            const viewRegionBounds = primaryView.visRegion.getContextCoordinates();
            const navContext = primaryView.visRegion.getNavigationContext();
            const data2 = data ? data[dataKey] : trackData[track.id].data;
            return data2.map(item => {
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
        const chords = data[dataKey].map(item => {
            return {
                source: { id: item.locus1.chr, start: item.locus1.start, end: item.locus1.start},
                target: { id: item.locus2.chr, start: item.locus2.end, end: item.locus2.end},
                value: item.score
            };
        });
        return chords;
    };

    drawCircos = (layout, chords, size) => {
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
                        opacity: 0.7,
                        color: '#ff5722',
                        tooltipContent: function (d) {
                            return '<p>' + d.source.id + ' ➤ ' + d.target.id + ': ' + d.value + '</p>'
                        },
                    },
                    }]}
                    size={size}
                />
    }

    render() {
        const { size } = this.props;
        const {layoutKey, dataKey} = this.state;
        const layout = this.getLayout()[layoutKey] || [];
        const chords = this.getChords(layoutKey, dataKey) || [];
        console.log(layout);
        console.log(chords);
        const chromOption = this.state.isLoadingData ? "Current chromosome (data still downloading)": "Current chromosome";
        const genomeOtion = this.state.isLoadingData ? "Whole genome (data still downloading)": "Whole genome";
        return (
            <div>
            <div className="CircletView-menu">
                <h3>Choose a layout range: </h3>
                <RadioGroup onChange={ this.onChangeLayout } value={this.state.layoutKey} horizontal>
                    <RadioButton value="currentRegion">
                        Current region
                    </RadioButton>
                    <RadioButton value="currentChromosome" disabled={this.state.isLoadingData}>
                        {chromOption}
                    </RadioButton>
                    <RadioButton value="wholeGenome" disabled={this.state.isLoadingData}>
                        {genomeOtion}
                    </RadioButton>
                </RadioGroup>
                <h3>Choose data from: </h3>
                <RadioGroup onChange={ this.onChangeData } value={this.state.dataKey} horizontal> 
                    <RadioButton value="currentRegion">
                        Current region
                    </RadioButton>
                    <RadioButton value="currentChromosome" disabled={this.state.isLoadingData}>
                        {chromOption}
                    </RadioButton>
                    <RadioButton value="wholeGenome" disabled={this.state.isLoadingData}>
                        {genomeOtion}
                    </RadioButton>
                </RadioGroup>
            </div>
            <div className="CircletView-container">
                {this.drawCircos(layout, chords, size)}
            </div>
            </div>
        );
    }
}

const chords2 = [
    {
        source: {
            id: 'chr6',
            start: 22186054,
            end: 26186054
        },
        target: {
            id: 'chr6',
            start: 31478117,
            end: 35478117
        }
    },
    {
        source: {
            id: 'chr6',
            start: 74807187,
            end: 78807187
        },
        target: {
            id: 'chr6',
            start: 89852878,
            end: 93852878
        }
    },
    {
        source: {
            id: 'chr6',
            start: 32372614,
            end: 36372614
        },
        target: {
            id: 'chr6',
            start: 125650987,
            end: 129650987
        }
    },
    {
        source: {
            id: 'chr6',
            start: 32372616,
            end: 36372616
        },
        target: {
            id: 'chr6',
            start: 157440784,
            end: 161440784
        }
    },
    {
        source: {
            id: 'chr2',
            start: 131012108,
            end: 135012108
        },
        target: {
            id: 'chr5',
            start: 172541752,
            end: 176541752
        }
    },
    {
        source: {
            id: 'chr1',
            start: 89852783,
            end: 93852783
        },
        target: {
            id: 'chr2',
            start: 131036705,
            end: 135036705
        }
    },



    {
        source: {
            id: 'chr1',
            start: -1431493,
            end: 2568507
        },
        target: {
            id: 'chr17',
            start: 31478117,
            end: 35478117
        }
    },
    {
        source: {
            id: 'chr17',
            start: 35360418,
            end: 39360418
        },
        target: {
            id: 'chr17',
            start: 31478115,
            end: 35478115
        }
    },
    {
        source: {
            id: 'chr17',
            start: 31478116,
            end: 35478116
        },
        target: {
            id: 'chrX',
            start: 106297810,
            end: 110297810
        }
    },
    {
        source: {
            id: 'chr17',
            start: 31478131,
            end: 35478131
        },
        target: {
            id: 'chr8',
            start: 134786084,
            end: 138786084
        }
    },
    {
        source: {
            id: 'chr17',
            start: 31478111,
            end: 35478111
        },
        target: {
            id: 'chr2',
            start: 86124673,
            end: 90124673
        }
    },
    {
        source: {
            id: 'chr17',
            start: 31478116,
            end: 35478116
        },
        target: {
            id: 'chr1',
            start: 235766312,
            end: 239766312
        }
    },
    {
        source: {
            id: 'chr17',
            start: 31478116,
            end: 35478116
        },
        target: {
            id: 'chr1',
            start: 89853039,
            end: 93853039
        }
    },
    {
        source: {
            id: 'chr17',
            start: 31478117,
            end: 35478117
        },
        target: {
            id: 'chr2',
            start: 131012644,
            end: 135012644
        }
    },
    {
        source: {
            id: 'chr17',
            start: 31478115,
            end: 35478115
        },
        target: {
            id: 'chr11',
            start: 83194786,
            end: 87194786
        }
    },
    {
        source: {
            id: 'chr17',
            start: 31478115,
            end: 35478115
        },
        target: {
            id: 'chr11',
            start: 83194786,
            end: 87194786
        }
    },
    {
        source: {
            id: 'chr17',
            start: 31478117,
            end: 35478117
        },
        target: {
            id: 'chr1',
            start: 89852849,
            end: 93852849
        }
    },
    {
        source: {
            id: 'chr17',
            start: 31478114,
            end: 35478114
        },
        target: {
            id: 'chrX',
            start: 106297713,
            end: 110297713
        }
    }
];
