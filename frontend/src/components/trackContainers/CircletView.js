import React from 'react';
import PropTypes from 'prop-types';
import Circos, { CHORDS } from 'react-circos';
import TrackModel from '../../model/TrackModel';
import { COLORS } from '../trackVis/commonComponents/MetadataIndicator';
import { HicSource } from '../../dataSources/HicSource';

import './CircletView.css';

/**
 * a component to draw circlet view for long range tracks
 * @author Daofeng Li
 */

export class CircletView extends React.PureComponent {
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
    }

    async componentDidMount(){
        const dataSource = new HicSource(this.props.track.url);
        const data = await dataSource.getDataAll(this.props.primaryView.visRegion, {binSize: 2500000});
        console.log(data);
    }

    getLayout = (primaryView, track, trackData) => {
        const navContext = primaryView.visRegion.getNavigationContext();
        const chrSet = new Set();
        trackData[track.id].data.forEach(item => {
            chrSet.add(item.locus1.chr);
            chrSet.add(item.locus2.chr);
        })
        const layout = [];
        navContext.getFeatures().forEach((feature, idx) => {
            // if (chrSet.has(feature.getName())) {
                layout.push(
                    {
                        len: feature.getLength(),
                        id: feature.getName(),
                        label: feature.getName(),
                        color: COLORS[idx]
                    }
                );
            // }
        });
        return layout;
    };

    getChords = (track, trackData) => {
        /**
         * the data looks like this:
         * 
        {
            "source": { "id": "chr19", "start": 22186054, "end": 26186054 },
            "target": { "id": "chr17", "start": 31478117, "end": 35478117 }
        },
        */
        const chords = trackData[track.id].data.map(item => {
            return {
                source: { id: item.locus1.chr, start: item.locus1.start - 2000000, end: item.locus1.start + 2000000 },
                target: { id: item.locus2.chr, start: item.locus2.end - 2000000, end: item.locus2.end + 2000000 },
                value: item.score
            };
        });
        return chords;
    };

    render() {
        const { size, primaryView, track, trackData } = this.props;
        const layout = track ? this.getLayout(primaryView, track, trackData): [];
        const chords = track? this.getChords(track, trackData): [];
        console.log(layout);
        console.log(chords);
        return (
            <div className="CircletView-container">
                <Circos
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
                            return '<h3>' + d.source.id + ' ➤ ' + d.target.id + ': ' + d.value + '</h3><i>(CTRL+C to copy to clipboard)</i>'
                        },
                    },
                    }]}
                    size={size}
                />
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
