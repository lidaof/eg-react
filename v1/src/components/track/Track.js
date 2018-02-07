import React from 'react';
import PropTypes from 'prop-types';

import BigWigTrack from './BigWigTrack';
import GeneAnnotationTrack from './geneAnnotationTrack/GeneAnnotationTrack';
import RulerTrack from './RulerTrack';
import withExpandedWidth from '../withExpandedWidth';

import TrackModel from '../../model/TrackModel';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import RegionExpander from '../../model/RegionExpander';
import { GeneFormatter } from '../../model/Gene';
import UnknownTrack from './UnknownTrack';
import TrackLoadingNotice from './TrackLoadingNotice';

export const TRACK_PROP_TYPES = {};

/**
 * Mapping from track type name to an object fulfilling the TrackSubtype interface.
 */
const TYPE_NAME_TO_SUBTYPE = {
    "ruler": RulerTrack,
    "bigwig": BigWigTrack,
};

const REGION_EXPANDER = new RegionExpander(1);
const WideDiv = withExpandedWidth('div');

export class Track extends React.PureComponent {
    static propTypes = {
        trackModel: PropTypes.instanceOf(TrackModel).isRequired,
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // The region of the genome to display
        width: PropTypes.number.isRequired, // Visible width of the track, including legend, metadata handle, etc.
        xOffset: PropTypes.number, // The horizontal amount to translate visualizations
    };

    static defaultProps = {
        xOffset: 0,
    };

    constructor(props) {
        super(props);
        this.initViewExpansion(props);
        this.initDataSource(props);
        this.state = {
            data: [],
            error: null,
        };
        this.state.isLoading = this.dataSource != null;
        this.fetchData(props);
    }

    /**
     * 
     * @param {*} props 
     * @return {TrackSubtype}
     */
    getTrackSubtype(props) {
        const typeName = props.trackModel.getType();
        const subtype = TYPE_NAME_TO_SUBTYPE[typeName] || UnknownTrack;
        return subtype;
    }

    initViewExpansion(props) {
        this.viewExpansion = REGION_EXPANDER.calculateExpansion(props.width, props.viewRegion);
    }

    /**
     * Sets this.dataSource.
     * @param {*} props 
     */
    initDataSource(props) {
        let trackSubType = this.getTrackSubtype(props);
        this.dataSource = trackSubType.getDataSource ? trackSubType.getDataSource(props.trackModel) : null;
    }

    /**
     * Uses this track's DataSource to fetch data within a view region, and then sets state.
     * 
     * @param {Object} props - props object; contains the region for which to fetch data
     * @return {Promise<any>} a promise that resolves when fetching is done, including when there is an error.
     */
    fetchData(props) {
        if (!this.dataSource) {
            return Promise.resolve();
        }

        return this.dataSource.getData(this.viewExpansion.expandedRegion).then(data => {
            // When the data finally comes in, be sure it is still what the user wants
            if (this.props.viewRegion === props.viewRegion) {
                this.setState({
                    isLoading: false,
                    data: data,
                    error: null,
                });
            }
        }).catch(error => {
            if (this.props.viewRegion === props.viewRegion) {
                if (process.env.NODE_ENV !== 'test') {
                    console.error(error);
                }
                this.setState({
                    isLoading: false,
                    error: error,
                });
            }
        });
    }

    /**
     * If the view region has changed, sends a request for data
     * 
     * @param {object} prevProps - previous props
     * @override
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.viewRegion !== nextProps.viewRegion) {
            this.initViewExpansion(nextProps);
            if (this.dataSource) {
                this.setState({isLoading: true});
                this.fetchData(nextProps);
            }
        }
    }

    /**
     * Calls cleanUp on the associated DataSource.
     */
    componentWillUnmount() {
        if (this.dataSource) {
            this.dataSource.cleanUp();
        }
    }

    render() {
        const {trackModel, width, xOffset} = this.props;
        const data = this.state.data;
        const subtype = this.getTrackSubtype(this.props);
        const Legend = subtype.legend;
        const Visualizer = subtype.visualizer;

        return (
        <div style={{position: "relative", display: "flex", border: "1px solid lightgrey", marginTop: -1}}>
            {this.state.isLoading ? <TrackLoadingNotice /> : null}
            <Legend trackModel={trackModel} data={data} />
            <WideDiv visibleWidth={width} viewExpansion={this.viewExpansion} xOffset={xOffset} >
                <Visualizer
                    data={data}
                    viewRegion={this.viewExpansion.expandedRegion}
                    trackModel={trackModel}
                    width={this.viewExpansion.expandedWidth}
                    error={this.state.error}
                />
            </WideDiv>
        </div>
        );
    }
}

export default Track;
