import React from 'react';
import PropTypes from 'prop-types';

import TrackLegend from './TrackLegend';
import TrackLoadingNotice from './TrackLoadingNotice';
import withExpandedWidth from '../withExpandedWidth';
import getComponentName from '../getComponentName';

import TrackModel from '../../model/TrackModel';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import RegionExpander from '../../model/RegionExpander';

import './Track.css';

/**
 * Props that will be passed to track legend components.
 */
export const LEGEND_PROP_TYPES = {
    trackModel: PropTypes.instanceOf(TrackModel), // Track metadata
    data: PropTypes.array, // Track data
};

/**
 * Props that will be passed to track visualizer components.
 */
export const VISUALIZER_PROP_TYPES = {
    trackModel: PropTypes.instanceOf(TrackModel), // Track metadata
    data: PropTypes.array, // Track data
    viewRegion: PropTypes.instanceOf(DisplayedRegionModel), // Region to visualize
    width: PropTypes.number, // Visualization width
};

/**
 * A function that returns a Component that only updates while its `isLoading` prop is false.  `isloading` will be
 * consumed; the wrapped component will not receive it.  This function exists since we don't want our visualizer to
 * rerender while data is loading.
 * 
 * @param {React.Component} WrappedComponent - Component to wrap
 * @return {React.Component} component that only updates while `isLoading` = false
 */
function freezeWhileLoading(WrappedComponent) {
    return class extends React.Component {
        static displayName = `freezeWhileLoading(${getComponentName(WrappedComponent)})`;

        shouldComponentUpdate(nextProps) {
            return !nextProps.isLoading;
        }

        render() {
            const {isLoading, ...rest} = this.props;
            return <WrappedComponent {...rest} />;
        }
    };
}

const REGION_EXPANDER = new RegionExpander(1);
const WideDiv = freezeWhileLoading(withExpandedWidth('div'));

/**
 * Manages the following common to all tracks:
 *     - Data fetch
 *     - Legend
 *     - Visualizer
 *     - Tooltip
 * These are all determined by the TYPE_NAME_TO_SUBTYPE map private to this module.  For more information on how this
 * all works, see TrackSubtype.ts and the README.
 * 
 * @author Silas Hsu
 */
export class Track extends React.PureComponent {
    static propTypes = {
        trackModel: PropTypes.instanceOf(TrackModel).isRequired, // Track metadata
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // The region of the genome to display
        width: PropTypes.number.isRequired, // Visible width of the track, including legend, metadata handle, etc.
        xOffset: PropTypes.number, // The horizontal amount to translate visualizations
        onContextMenu: PropTypes.func, // Works as one would expect
        onClick: PropTypes.func, // Works as one would expect
    };

    static defaultProps = {
        xOffset: 0,
    };

    /**
     * Initializes data source and state.
     * 
     * @param {Object} props - props as specified by React
     */
    constructor(props) {
        super(props);
        this.initViewExpansion(props);
        const trackSubtype = props.trackModel.getRenderConfig();
        this.dataSource = trackSubtype.getDataSource ? trackSubtype.getDataSource(props.trackModel) : null;

        this.state = {
            data: [],
            isLoading: this.dataSource != null,
            error: null,
        };
        this.fetchData(props);
    }

    /**
     * Sets `this.viewExpansion`, which is a widening of the view that allows scrolling data into view.
     * 
     * @param {Object} props - props passed to this component
     */
    initViewExpansion(props) {
        this.viewExpansion = REGION_EXPANDER.calculateExpansion(props.width, props.viewRegion);
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

    /**
     * Renders track legend, visualizer, loading notice, etc.
     * 
     * @return {JSX.Element} element to render
     * @override
     */
    render() {
        const {trackModel, width, xOffset, onContextMenu} = this.props;
        const data = this.state.data;
        const trackSubtype = trackModel.getRenderConfig();
        const Legend = trackSubtype.legend || TrackLegend; // Default to TrackLegend if there is none specified.
        const Visualizer = trackSubtype.visualizer;
        const style = {
            position: "relative",
            display: "flex",
            border: "1px solid lightgrey",
            marginTop: -1, // -1 so borders collapse.  TODO: put tracks in a table so we can use border-collapse CSS?
            backgroundColor: this.state.error ? "red" : "white",
        };

        return (
        <div style={style} className={trackModel.isSelected ? "Track-selected-border" : undefined} onContextMenu={onContextMenu} >
            {this.state.isLoading ? <TrackLoadingNotice /> : null}
            <Legend trackModel={trackModel} data={data} />
            <WideDiv
                isLoading={this.state.isLoading}
                visibleWidth={width}
                viewExpansion={this.viewExpansion}
                xOffset={xOffset}
            >
                <Visualizer
                    data={data}
                    viewRegion={this.viewExpansion.expandedRegion}
                    width={this.viewExpansion.expandedWidth}
                    trackModel={trackModel}
                />
            </WideDiv>
        </div>
        );
    }
}

export default Track;
