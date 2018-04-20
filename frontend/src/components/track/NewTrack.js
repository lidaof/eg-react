import React from 'react';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';

import TrackLoadingNotice from './commonComponents/TrackLoadingNotice';
import MetadataIndicator from './commonComponents/MetadataIndicator';
import withExpandedWidth from '../withExpandedWidth';

import TrackModel from '../../model/TrackModel';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import RegionExpander from '../../model/RegionExpander';

import './Track.css';

export const REGION_EXPANDER = new RegionExpander(1);
REGION_EXPANDER.calculateExpansion = memoizeOne(REGION_EXPANDER.calculateExpansion);
const WideDiv = withExpandedWidth('div');

/**
 * Displays track legends, visualizers, and metadata bars more-or-less consistently.
 * 
 * @author Silas Hsu
 */
export class NewTrack extends React.Component {
    static propTypes = {
        ///////////////////////////////////////
        // Props provided by TrackContainers // -- Track subtypes should pass these through
        ///////////////////////////////////////
        trackModel: PropTypes.instanceOf(TrackModel).isRequired, // Track metadata
        width: PropTypes.number.isRequired, // Width of the track's visualizer
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // The region of the genome to display
        metadataTerms: PropTypes.arrayOf(PropTypes.string), // Terms for which to render metadata handles
        xOffset: PropTypes.number, // The horizontal amount to translate visualizations
        index: PropTypes.number, // Number to use as the last parameter in the following callbacks
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

        //////////////////////////////////////////////
        // Props that track subtypes should provide //
        //////////////////////////////////////////////
        legendElement: PropTypes.node.isRequired, // Track legend to render
        /**
         * Callback that renders visualizer.  Should return a React element.  Signature
         *     (viewRegion: DisplayedRegionModel, width: number, viewWindow: OpenInterval): JSX.Element
         *         `viewRegion` - region to visualize
         *         `width` - width to visualize
         *         `viewWindow` - x range of visible pixels assuming an xOffset of 0
         */
        getVisualizerElement: PropTypes.func.isRequired,
        isLoading: PropTypes.bool, // If true, applies loading styling
        error: PropTypes.any, // If present, applies error styling
        visualizerBackgroundColor: PropTypes.string, // Background color, for the visualizer ONLY
    };

    static defaultProps = {
        xOffset: 0,
        onContextMenu: (event) => undefined,
        onClick: (event) => undefined,
        onMetadataClick: (event, term) => undefined,
    };

    constructor(props) {
        super(props);
        this.ignoreNextClick = false;
        this.handleContextMenu = this.handleContextMenu.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleMetadataClick = this.handleMetadataClick.bind(this);
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
     * Renders track legend, visualizer, loading notice, etc.
     * 
     * @return {JSX.Element} element to render
     * @override
     */
    render() {
        const {
            trackModel, width, viewRegion, metadataTerms, xOffset, // Track container props
            legendElement, getVisualizerElement, isLoading, error, visualizerBackgroundColor, // Track subtype props
        } = this.props;
        const viewExpansion = REGION_EXPANDER.calculateExpansion(width, viewRegion);
        const {expandedRegion, expandedWidth, viewWindow} = viewExpansion;

        return (
        <div
            style={{backgroundColor: error ? "pink" : "white"}}
            className={trackModel.isSelected ? "Track Track-selected-border" : "Track"}
            onContextMenu={this.handleContextMenu}
            onClick={this.handleClick}
        >
            {isLoading ? <TrackLoadingNotice /> : null}
            {legendElement}
            <WideDiv
                viewExpansion={viewExpansion}
                xOffset={xOffset}
                style={{backgroundColor: visualizerBackgroundColor}}
            >
                {getVisualizerElement(expandedRegion, expandedWidth, viewWindow)}
            </WideDiv>
            <MetadataIndicator track={trackModel} terms={metadataTerms} onClick={this.handleMetadataClick} />
        </div>
        );
    }
}

export default NewTrack;
