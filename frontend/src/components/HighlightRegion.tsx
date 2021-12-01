import React from 'react';
import OpenInterval from '../model/interval/OpenInterval';
import LinearDrawingModel from '../model/LinearDrawingModel';
import { withTrackLegendWidth } from './withTrackLegendWidth';
import { ViewExpansion } from '../model/RegionExpander';
import ChromosomeInterval from '../model/interval/ChromosomeInterval';
import { HighlightItem, HighlightItemProps } from '../components/trackContainers/HighlightMenu';
import { StateWithHistory } from 'redux-undo';

import './HighlightRegion.css';
import AppState, { ActionCreators } from 'AppState';
import { connect } from 'react-redux';

interface HighlightRegionProps {
    y?: number | string; // Relative Y of the top of the selection box; how far from the top of this container
    height?: number | string; // Height of the selection box
    enteredRegion: ChromosomeInterval;
    highlightEnteredRegion: boolean;
    visData: ViewExpansion;
    legendWidth: number;
    xOffset: number;
    highlightColor: string;
    highlightItems: HighlightItemProps[];
}

/**
 * Gets props to pass to HighlightableTrackContainer.
 * 
 * @param {Object} state - redux state
 * @return {Object} props to pass to RegionSetSelector
 */
 function mapStateToProps(state: { browser: StateWithHistory<AppState> }) {
    return {
        highlightItems: state.browser.present.highlightItems
    };
}

/**
 * Callbacks to pass to HighlightMenu
 */
const callbacks = {
    onSetsChanged: ActionCreators.setHighlights
};


/**
 * Creates a box that highlight user's entered region, from gene or region locator
 * 
 * @author Daofeng Li, modified from Silas Hsu
 */
class HighlightRegion extends React.PureComponent<HighlightRegionProps> {
    static defaultProps: HighlightRegionProps = {
        y: "0px",
        height: "100%",
        enteredRegion: null,
        highlightEnteredRegion: true,
        visData: null,
        legendWidth: 120,
        xOffset: 0,
        highlightColor: 'rgba(255, 255, 0, 0.3)',
        highlightItems: [],
    };

    constructor(props: HighlightRegionProps | Readonly<HighlightRegionProps>) {
        super(props);
    }

    /**
     * Initializes state, binds event listeners, and attaches a keyboard listener to the window, which will listen for
     * requests to cancel a selection.
     * 
     * @param {Object} props - props as specified by React
     */

    getHiglightedXs(chrInterval: ChromosomeInterval): OpenInterval {
        const {legendWidth, visData} = this.props;
        const {viewWindowRegion, viewWindow} = visData;
        const intervals = viewWindowRegion.getNavigationContext().convertGenomeIntervalToBases(chrInterval);
        // there will be many interval when there are gaps
        const drawModel = new LinearDrawingModel(viewWindowRegion, viewWindow.getLength());
        const interval = new OpenInterval(intervals[0].start, intervals[intervals.length - 1].end);
        const xRegion = drawModel.baseSpanToXSpan(interval);
        let start = Math.max(legendWidth, xRegion.start + legendWidth);
        let end = xRegion.end + legendWidth;
        if (end <= start) {
            start = -1;
            end = 0;
        }
        return new OpenInterval(start, end);
    }

    /**
     * @inheritdoc
     */
    render(): JSX.Element {
        const {height, y, children, enteredRegion, highlightEnteredRegion, xOffset, highlightColor, highlightItems } = this.props;
        const highlight = enteredRegion ? this.getHiglightedXs(enteredRegion) : null;
        const style = highlight ? {
            left: highlight.start + xOffset + "px",
            top: y,
            width: highlight.getLength() + "px",
            height,
            backgroundColor: highlightColor,
        } : null;
        const className = highlightEnteredRegion ? "HighlightRegion-box" : "HighlightRegion-none";
        const theBox = <div className={className} style={style} />;

        console.log(highlightItems);

        // pushes new HighlightItem to Redux
        if (highlight) {
            const newHighlightItem: HighlightItemProps = {
                color: highlightColor,
                inViewRegion: highlightEnteredRegion,
                viewRegion: highlight,
            }
            if (highlightItems.length !== 0) {
                var noMatches = true;
                for (var i = 0; i < highlightItems.length; i++) {
                    console.log(newHighlightItem, highlightItems[i]);
                    if (newHighlightItem.color === highlightItems[i].color &&
                        newHighlightItem.viewRegion.start === highlightItems[i].viewRegion.start &&
                        newHighlightItem.viewRegion.end === highlightItems[i].viewRegion.end) {
                            noMatches = false;
                            break;
                        }
                };
                if (noMatches) {
                        highlightItems.push(newHighlightItem);
                        console.log('pushing new highlightItem', highlightItems);
                }
            } else {
                highlightItems.push(newHighlightItem);
                console.log('pushing new highlightItem', highlightItems);
            }

        }

        return (
        <div
            style={{position: "relative", overflow: "hidden"}}
        >
            {theBox}
            {children}
        </div>
        );
    }
}

export default connect(mapStateToProps, callbacks)(withTrackLegendWidth(HighlightRegion));