import React from 'react';
import PropTypes from 'prop-types';
import MetadataIndicator from './MetadataIndicator';
import TrackMessage from './TrackMessage';

import TrackModel from '../../../model/TrackModel';
import DisplayedRegionModel from '../../../model/DisplayedRegionModel';
import OpenInterval from '../../../model/interval/OpenInterval';

import spinner from '../../../images/loading-small.gif';
import './Track.css';

const ERROR_COLOR = "pink";

/**
 * Displays track legends, visualizers, and metadata bars more-or-less consistently.
 * 
 * @author Silas Hsu
 */
class Track extends React.Component {
    /**
     * Props that TrackContainers provide.  Track subtypes should require them in their propTypes, and use them in any
     * way they wish.  Be sure to pass them through to this component!
     */
    static propsFromTrackContainer = {
        trackModel: PropTypes.instanceOf(TrackModel).isRequired, // Track metadata
        width: PropTypes.number.isRequired, // Width of the track's visualizer
        /**
         * The region of the nav context to display.  This component doesn't use it, but most visualizers would
         * probably be interested.
         */
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, 
        viewWindow: PropTypes.instanceOf(OpenInterval).isRequired, // Visible portion of the visualizer
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
    };

    static propTypes = Object.assign({}, Track.propsFromTrackContainer, {
        // Track containers do not provide the following.  Track subtypes must provide them.
        legend: PropTypes.node.isRequired, // Track legend to render
        visualizer: PropTypes.node.isRequired, // Track visualizer to render
        message: PropTypes.node, // Track messages, notifications, etc. to display

        // `isLoading` and `error` can be provided by the configDataFetch HOC.
        isLoading: PropTypes.bool, // If true, applies loading styling
        error: PropTypes.any, // If present, applies error styling

        options: PropTypes.shape({ // Track options object
            backgroundColor: PropTypes.string // Visualizer background color
        })
    });

    static defaultProps = {
        xOffset: 0,
        onContextMenu: (event, index) => undefined,
        onClick: (event, index) => undefined,
        onMetadataClick: (event, term, index) => undefined,
        options: {}
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
            trackModel, width, viewWindow, metadataTerms, xOffset, // Track container props
            legend, visualizer, message, isLoading, error, options, // Track subtype props
        } = this.props;
        return (
        <div
            style={{backgroundColor: error ? ERROR_COLOR : undefined}}
            className={trackModel.isSelected ? "Track Track-selected-border" : "Track"}
            onContextMenu={this.handleContextMenu}
            onClick={this.handleClick}
        >
            {legend}
            <div style={{backgroundColor: options.backgroundColor, overflowX: "hidden"}}>
                {isLoading && <TrackLoadingNotice />}
                <FreezeWhileLoading isLoading={isLoading} >
                    <ViewWindow
                        viewWindow={viewWindow}
                        fullWidth={width}
                        xOffset={xOffset}
                    >
                        {visualizer}
                    </ViewWindow>
                </FreezeWhileLoading>
                {message}
                {error && <ErrorMessage />}
            </div>
            <MetadataIndicator track={trackModel} terms={metadataTerms} onClick={this.handleMetadataClick} />
        </div>
        );
    }
}

/**
 * A notice that a track is loading data.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element}
 */
function TrackLoadingNotice(props) {
    return <div className="Track-loading-notice">
        <img className="img-fluid" alt="Loading..." src={spinner} />
    </div>;
}

function ErrorMessage(props) {
    const message = "⚠️ Data fetch failed.  Reload page or change view to retry.";
    return <TrackMessage message={message} style={{backgroundColor: ERROR_COLOR}} />;
}

/**
 * A component that has a "window" that displays only a portion of its (presumably) wider children.  The window can be
 * horizontally scrolled via the `xOffset` prop.  By default the view window is horizontally centered on the children.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
function ViewWindow(props) {
    const {viewWindow, fullWidth, children} = props;
    // Actually, props.xOffset stores the dragged amount and draggedAmount stores the actual amount we will xOffset.
    let draggedAmount = props.xOffset || 0;
    if (draggedAmount > 0) {
        // Dragging stuff on the left into view.  So, we limit to how many pixels exist on the left.
        draggedAmount = Math.min(draggedAmount, viewWindow.start);
    } else {
        // Ditto for dragging stuff on the right into view.
        const numPixelsOnRight = fullWidth - viewWindow.end;
        draggedAmount = Math.max(-numPixelsOnRight, draggedAmount);
    }

    const outerStyle = {
        overflowX: "hidden",
        width: viewWindow.getLength(),
    };

    const innerStyle = {
        position: "relative",
        // -viewWindow.start centers the view, rather than it starting at the leftmost part of the inner element.
        transform: `translateX(${-viewWindow.start + draggedAmount}px)`,
        willChange: 'transform'
    };

    return (
    <div style={outerStyle}>
        <div width={fullWidth} style={innerStyle} >
            {children}
        </div>
    </div>
    );
}

class FreezeWhileLoading extends React.Component {
    shouldComponentUpdate(nextProps) {
        return !nextProps.isLoading;
    }

    render() {
        return this.props.children;
    }
}

export default Track;
