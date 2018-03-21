import React from 'react';
import PropTypes from 'prop-types';

import TrackLoadingNotice from './TrackLoadingNotice';
import MetadataIndicator from './MetadataIndicator';

import withExpandedWidth from '../withExpandedWidth';
import getComponentName from '../getComponentName';
import { getSubtypeConfig } from './subtypeConfig';

import TrackModel from '../../model/TrackModel';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import RegionExpander from '../../model/RegionExpander';
import OpenInterval from '../../model/interval/OpenInterval';

import './Track.css';

/**
 * Props that will be passed to track legend components.
 */
export const LEGEND_PROP_TYPES = {
    trackModel: PropTypes.instanceOf(TrackModel).isRequired, // Track metadata
    data: PropTypes.array.isRequired, // Track data
};

/**
 * Props that will be passed to track visualizer components.
 */
export const VISUALIZER_PROP_TYPES = {
    trackModel: PropTypes.instanceOf(TrackModel).isRequired, // Track metadata
    data: PropTypes.array.isRequired, // Track data
    viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // Region to visualize
    width: PropTypes.number.isRequired, // Visualization width
    /**
     * X range of visible pixels, assuming the user has not dragged the view
     */
    viewWindow: PropTypes.instanceOf(OpenInterval),
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
 * These are all determined by getSubtypeConfig.js.  For more information on how this all works, see TrackSubtype.ts and
 * the README.
 * 
 * @author Silas Hsu
 */
export class Track extends React.PureComponent {
    static propTypes = {
        trackModel: PropTypes.instanceOf(TrackModel).isRequired, // Track metadata
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // The region of the genome to display
        width: PropTypes.number.isRequired, // Width of the track's visualizer
        metadataTerms: PropTypes.arrayOf(PropTypes.string), // Terms for which to render metadata handles
        xOffset: PropTypes.number, // The horizontal amount to translate visualizations
        index: PropTypes.number, // The index of the track in the parent container.  Passed directly to the callbacks.
        /**
         * Called on context menu events.  Signature: (event: MouseEvent, index: number): void
         */
        onContextMenu: PropTypes.func,
        /**
         * Called on click events, except those clicks that happen on the metadata indicator.
         * Signature: (event: MouseEvent, index: number): void
         */
        onClick: PropTypes.func,
        /**
         * Called when user clicks on a metadata box.  Signature: (event: MouseEvent, term: string, index: number)
         *     `event` - the click event
         *     `term` - the metadata term associated with the box
         *     `index` - the index prop passed to the track
         */
        onMetadataClick: PropTypes.func,
    };

    static defaultProps = {
        xOffset: 0,
        onContextMenu: () => undefined,
        onClick: () => undefined,
        onMetadataClick: () => undefined,
    };

    /**
     * Initializes data source and state.
     * 
     * @param {Object} props - props as specified by React
     */
    constructor(props) {
        super(props);
        this.initViewExpansion(props);
        const trackSubtype = getSubtypeConfig(props.trackModel);
        this.dataSource = trackSubtype.getDataSource ? trackSubtype.getDataSource(props.trackModel) : null;

        this.state = {
            data: [],
            isLoading: this.dataSource != null,
            error: null,
        };
        this.fetchData(props);

        this.ignoreNextClick = false;
        this.handleContextMenu = this.handleContextMenu.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleMetadataClick = this.handleMetadataClick.bind(this);
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

    handleContextMenu(event) {
        this.props.onContextMenu(event, this.props.index);
    }

    handleClick(event) {
        if (!this.ignoreNextClick) {
            this.props.onClick(event, this.props.index);
        }
        this.ignoreNextClick = false;
    }

    handleMetadataClick(event, term) {
        this.ignoreNextClick = true; // Since the onClick event will be called right after this
        this.props.onMetadataClick(event, term, this.props.index);
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
        const {trackModel, xOffset, metadataTerms} = this.props;
        const data = this.state.data;
        const trackSubtype = getSubtypeConfig(trackModel);
        const Legend = trackSubtype.legend;
        const Visualizer = trackSubtype.visualizer;

        return (
        <div
            style={{backgroundColor: this.state.error ? "pink" : "white"}}
            className={trackModel.isSelected ? "Track Track-selected-border" : "Track"}
            onContextMenu={this.handleContextMenu}
            onClick={this.handleClick}
        >
            {this.state.isLoading ? <TrackLoadingNotice /> : null}
            <Legend trackModel={trackModel} data={data} />
            <WideDiv
                isLoading={this.state.isLoading}
                viewExpansion={this.viewExpansion}
                xOffset={xOffset}
                style={{backgroundColor: trackModel.options.backgroundColor}}
            >
                <Visualizer
                    data={data}
                    viewRegion={this.viewExpansion.expandedRegion}
                    width={this.viewExpansion.expandedWidth}
                    viewWindow={this.viewExpansion.viewWindow}
                    trackModel={trackModel}
                />
            </WideDiv>
            <MetadataIndicator track={trackModel} terms={metadataTerms} onClick={this.handleMetadataClick} />
        </div>
        );
    }
}

export default Track;
