import DataSource from '../dataSources/DataSource';
import DisplayedRegionModel from '../model/DisplayedRegionModel';
import PropTypes from 'prop-types';
import React from 'react';
import TrackModel from '../model/TrackModel';

/**
 * A track for the genome browser.  This extendable class provides functionality common to all tracks, such as data
 * fetching and view dragging.
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

        width: PropTypes.number, // The width of the track
        xOffset: PropTypes.number, // The horizontal amount to translate visualizations
        onNewData: PropTypes.func, // Callback when the track loads new data.  Called with no arguments.
        dataSourceOverride: PropTypes.instanceOf(DataSource), // Source of data for this Track; overrides the default
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
        // We fork the xOffset prop because we want to set it to 0 when data finishes loading, regardless of the value
        // of the prop.

        this.dataSource = this.props.dataSourceOverride || this.makeDefaultDataSource();

        this.fetchData = this.fetchData.bind(this);
        this.fetchData(this.props.viewRegion);
    }

    makeDefaultDataSource() {
        throw new Error("No default data source defined");
    }

    fetchData(viewRegion) {
        return this.dataSource.getData(viewRegion).then(data => {
            // When the data finally comes in, be sure it is still what the user wants
            if (this.props.viewRegion === viewRegion) {
                this.setState({
                    isLoading: false,
                    data: data,
                    error: null,
                });
                if (this.props.onNewData) {
                    this.props.onNewData();
                }
            }
        })
        .catch(error => {
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
        if (this.props.viewRegion !== nextProps.viewRegion) {
            nextStateObj.isLoading = true;
            this.fetchData(nextProps.viewRegion);
        }

        if (this.props.dataSourceOverride !== nextProps.dataSourceOverride) {
            this.dataSource = nextProps.dataSourceOverride || this.makeDefaultDataSource();
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
