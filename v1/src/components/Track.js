import React from 'react';
import PropTypes from 'prop-types';

import DataSource from '../dataSources/DataSource';
import DisplayedRegionModel from '../model/DisplayedRegionModel';
import TrackModel from '../model/TrackModel';
import RegionExpander from '../model/RegionExpander';

/**
 * A track for the genome browser.  This extendable class provides functionality common to all tracks, such as data
 * fetching.
 * 
 * @author Silas Hsu
 */
class Track extends React.Component {
    /**
     * Name to compare to a TrackModel's type when creating new Tracks
     */
    static TYPE_NAME = "please override me";

    static propTypes = {
        trackModel: PropTypes.instanceOf(TrackModel).isRequired, // Metadata for this track
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // The region of the genome to display

        viewExpansionValue: PropTypes.number, // How much to enlarge view on both sides
        width: PropTypes.number, // The width of the track
        xOffset: PropTypes.number, // The horizontal amount to translate visualizations
        onNewData: PropTypes.func, // Callback when the track loads new data.  Called with no arguments.
        dataSourceOverride: PropTypes.instanceOf(DataSource), // Source of data for this Track; overrides the default
    }

    static defaultProps = {
        viewExpansionValue: 0,
        width: 100,
        xOffset: 0,
        onNewData: () => undefined
    }

    /**
     * Initializes state and immediately sends a request for data.
     * 
     * @param {object} props 
     */
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            data: null,
            error: null,
        };

        this.dataSource = this.props.dataSourceOverride || this.makeDefaultDataSource();

        this.fetchData = this.fetchData.bind(this);
        this.fetchData(this.props.viewRegion);
    }

    /**
     * Gets this track's default data source.  Is called upon construction.  Subclasses must override this!
     * 
     * @return {DataSource} default data source for this Track
     */
    makeDefaultDataSource() {
        throw new Error("No default data source defined");
    }

    /**
     * Uses this track's DataSource to fetch data within a view region, and then sets state.
     * 
     * @param {DisplayedRegionModel} viewRegion - the region for which to fetch data
     * @return {Promise<any>} a promise that resolves when fetching is done, including when there is an error.
     */
    fetchData(viewRegion) {
        let expandedRegion = new RegionExpander(this.props.viewExpansionValue).makeExpandedRegion(viewRegion);
        return this.dataSource.getData(expandedRegion).then(data => {
            // When the data finally comes in, be sure it is still what the user wants
            if (this.props.viewRegion === viewRegion) {
                this.setState({
                    isLoading: false,
                    data: data,
                    error: null,
                });
                this.props.onNewData();
            }
        })
        .catch(error => {
            if (process.env.NODE_ENV !== "test") {
                console.error(error);
            }
            if (this.props.viewRegion === viewRegion) {
                this.setState({
                    error: error,
                });
            }
        });
    }

    /**
     * If the view region has changed, sends a request for data
     * 
     * @param {object} nextProps - new props that the component will receive
     * @override
     */
    componentWillReceiveProps(nextProps) {
        let nextStateObj = {};
        if (this.props.dataSourceOverride !== nextProps.dataSourceOverride) {
            this.dataSource = nextProps.dataSourceOverride || this.makeDefaultDataSource();
        }

        if (this.props.viewRegion !== nextProps.viewRegion) {
            nextStateObj.isLoading = true;
            this.fetchData(nextProps.viewRegion);
        }

        this.setState(nextStateObj);
    }

    /**
     * By default, returns nothing.  Subclasses can and should override this.  this.state.isLoading` tells if data
     * is currently being fetched, and `this.state.data` contains the actual data to display.
     * 
     * @return {null}
     */
    render() {
        return null;
    }
}

export default Track;
