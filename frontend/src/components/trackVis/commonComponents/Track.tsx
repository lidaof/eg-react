import React from 'react';
import { PositionProperty } from 'csstype';

import MetadataIndicator from './MetadataIndicator';
import TrackMessage from './TrackMessage';

import { TrackData } from '../../trackContainers/TrackDataManager';
import TrackModel, { TrackOptions } from '../../../model/TrackModel';
import OpenInterval from '../../../model/interval/OpenInterval';

import spinner from '../../../images/loading-small.gif';
import './Track.css';

const ERROR_COLOR = 'pink';

/**
 * Props that TrackContainers provide.  Track subtypes may read and use them in any way they wish.  Be sure to pass them
 * through to this component!
 */
export interface PropsFromTrackContainer extends TrackData {
    trackModel: TrackModel; // Track metadata
    width: number; // Width of the visualizer
    viewWindow: OpenInterval; // Visible portion of the visualizer
    metadataTerms?: string[]; // Terms for which to render metadata handles
    xOffset?: number; // The horizontal amount to translate visualizations
    index?: number; // Number to pass in the callbacks
    options?: TrackOptions; // Track options
    style?: object; // optional style from each track file

    /**
     * Callback for context menu events.
     * 
     * @param {React.MouseEvent} event - the event that triggered the callback
     * @param {number} index - this component's `index` prop
     */
    onContextMenu?(event: React.MouseEvent, index: number): void;

    /**
     * Callback for click events EXCEPT those on the metadata indicators.
     * 
     * @param {React.MouseEvent} event - the event that triggered the callback
     * @param {number} index - this component's `index` prop
     */
    onClick?(event: React.MouseEvent, index: number): void;

    /**
     * Callback for clicks on the metadata indicators
     * 
     * @param {React.MouseEvent} event - the event that triggered the callback
     * @param {string} term - the metadata term that was clicked
     * @param {number} index - this component's `index` prop
     */
    onMetadataClick?(event: React.MouseEvent, term: string, index: number): void;
}

/**
 * Track containers do not provide the following.  Track subtypes must provide them.
 */
interface CustomizationProps {
    legend: JSX.Element; // Track legend to render
    visualizer: JSX.Element; // Track visualizer to render
    message?: JSX.Element; // Track messages, notifications, etc. to display
}

type TrackProps = PropsFromTrackContainer & CustomizationProps;

/**
 * Displays track legends, visualizers, and metadata bars more-or-less consistently.
 * 
 * @author Silas Hsu
 */
class Track extends React.Component<TrackProps> {
    static defaultProps: Partial<TrackProps> = {
        xOffset: 0,
        onContextMenu: () => undefined,
        onClick: () => undefined,
        onMetadataClick: () => undefined,
        options: {}
    };

    private ignoreNextClick: boolean;

    constructor(props: TrackProps) {
        super(props);
        this.ignoreNextClick = false;
        this.handleContextMenu = this.handleContextMenu.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleMetadataClick = this.handleMetadataClick.bind(this);
    }

    handleContextMenu(event: React.MouseEvent) {
        this.props.onContextMenu(event, this.props.index);
    }

    handleClick(event: React.MouseEvent) {
        if (!this.ignoreNextClick) {
            this.props.onClick(event, this.props.index);
        }
        this.ignoreNextClick = false;
    }

    handleMetadataClick(event: React.MouseEvent, term: string) {
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
            style
        } = this.props;
        return (
        <div
            style={{backgroundColor: error ? ERROR_COLOR : undefined}}
            className={trackModel.isSelected ? "Track Track-selected-border" : "Track"}
            onContextMenu={this.handleContextMenu}
            onClick={this.handleClick}
        >
            {legend}
            <div style={{...style, backgroundColor: options.backgroundColor, overflowX: "hidden"}}>
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
 * @param {object} props - props as specified by React
 * @return {JSX.Element}
 */
function TrackLoadingNotice(props: {}): JSX.Element {
    return <div className="Track-loading-notice">
        <img className="img-fluid" alt="Loading..." src={spinner} />
    </div>;
}

function ErrorMessage(props: {}): JSX.Element {
    const message = "⚠️ Data fetch failed.  Reload page or change view to retry.";
    return <TrackMessage message={message} style={{backgroundColor: ERROR_COLOR}} />;
}

interface ViewWindowProps {
    viewWindow: OpenInterval;
    fullWidth: number;
    children: JSX.Element;
    xOffset?: number;
}
/**
 * A component that has a "window" that displays only a portion of its (presumably) wider children.  The window can be
 * horizontally scrolled via the `xOffset` prop.  By default the view window is horizontally centered on the children.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
function ViewWindow(props: ViewWindowProps): JSX.Element {
    const {viewWindow, fullWidth, children} = props;
    // Actually, props.xOffset stores the dragged amount and draggedAmount stores the actual amount we will xOffset.
    const xOffset = props.xOffset || 0;
    const outerStyle = {
        overflow: "hidden",
        width: viewWindow.getLength(),
    };
    const innerStyle = {
        width: fullWidth,
        position: "relative" as PositionProperty,
        // -viewWindow.start centers the view, rather than it starting at the leftmost part of the inner element.
        transform: `translateX(${-viewWindow.start + xOffset}px)`,
        willChange: 'transform'
    };

    return (
    <div style={outerStyle}>
        <div style={innerStyle} >{children}</div>
    </div>
    );
}

interface FreezeWhileLoadingProps {
    isLoading?: boolean;
}
/**
 * A component that stops updating its children if passed a truthy `isLoading` prop.
 */
class FreezeWhileLoading extends React.Component<FreezeWhileLoadingProps> {
    shouldComponentUpdate(nextProps: FreezeWhileLoadingProps) {
        return !nextProps.isLoading;
    }

    render() {
        return this.props.children;
    }
}

export default Track;
