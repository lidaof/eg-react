import React from 'react';
import OpenInterval from '../model/interval/OpenInterval';
import LinearDrawingModel from '../model/LinearDrawingModel';
import { withTrackLegendWidth } from './withTrackLegendWidth';
import { ViewExpansion } from '../model/RegionExpander';
import ChromosomeInterval from '../model/interval/ChromosomeInterval';
import { HighlightItem, IHighlightItem } from '../components/trackContainers/HighlightMenu';
import { StateWithHistory } from 'redux-undo';

import './HighlightRegion.css';
import AppState, { ActionCreators } from 'AppState';
import { connect } from 'react-redux';

interface HighlightRegionProps {
    y?: number | string; // Relative Y of the top of the selection box; how far from the top of this container
    height?: number | string; // Height of the selection box
    enteredRegion: OpenInterval; // region that is highlighted in absolute genome coordinates;
    highlightEnteredRegion: boolean;
    visData: ViewExpansion; // contains data on chromosome start/stop, and window start/stop;
    legendWidth: number; // used in calculation for highlight;
    xOffset: number;
    viewRegion: ChromosomeInterval;
    highlightColor: string;
    highlightItems: IHighlightItem[];
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
        viewRegion: null,
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

    getHighlightedXs(interval: OpenInterval): OpenInterval {
        const {legendWidth, visData} = this.props;
        const {viewWindowRegion, viewWindow} = visData;

        let start, end;
        const drawModel = new LinearDrawingModel(viewWindowRegion, viewWindow.getLength());
        const xRegion = drawModel.baseSpanToXSpan(interval);
        start = Math.max(legendWidth, xRegion.start + legendWidth);
        end = xRegion.end + legendWidth;

        if (end <= start) {
            start = -1;
            end = 0;
        }
        return new OpenInterval(start, end);
    }

    /**
     * Input pathway: original HighlightRegion.tsx functionality, code cut/copied from render();
     * @returns new HighlightItem data object
     */
    createNewHighlightItem(): void {
        const { enteredRegion, highlightEnteredRegion, highlightColor, highlightItems, viewRegion, visData } = this.props;
        const highlight = enteredRegion ? this.getHighlightedXs(enteredRegion) : null;
        
        // pushes new HighlightItem to Redux
        if (highlight) {
            const coords = visData.visRegion.customRegionAsString(enteredRegion.start, enteredRegion.end);
            const newHighlightItem: IHighlightItem = {
                active: true,
                color: highlightColor,
                highlightName: 'New Highlight',
                highlightInterval: highlight,
                viewRegion: coords,
                absoluteInterval: enteredRegion
            }
            if (highlightItems.length !== 0) {
                var noMatches = true;
                for (var i = 0; i < highlightItems.length; i++) {
                    if (newHighlightItem.color === highlightItems[i].color &&
                        newHighlightItem.absoluteInterval.start === highlightItems[i].absoluteInterval.start &&
                        newHighlightItem.absoluteInterval.end === highlightItems[i].absoluteInterval.end) {
                            noMatches = false;
                            break;
                        }
                };
                if (noMatches) {
                        highlightItems.push(newHighlightItem);
                }
            } else {
                highlightItems.push(newHighlightItem);
            }
        }
    }

    recalculateHighlightItem(item: IHighlightItem): IHighlightItem {
        const highlight = this.getHighlightedXs(item.absoluteInterval);
        const newIHighlight = {
            active: true,
            color: item.color,
            highlightName: item.highlightName,
            highlightInterval: highlight,
            viewRegion: item.viewRegion,
            absoluteInterval: item.absoluteInterval
        }

        return newIHighlight;
    }

    

    /**
     * checks every HighlightItem in the highlightItems prop and renders those in the view region;
     * @returns container that has highlight elements in it
     * @inheritdoc
     */
    render(): JSX.Element {
        const { height, y, children, enteredRegion, viewRegion, highlightEnteredRegion, xOffset, highlightColor, highlightItems, visData } = this.props;

        // logical check for whether to create new highlightItem is through value of enteredRegion prop
        // enteredRegion === null => no new highlight
        this.createNewHighlightItem();

        const theBoxes = highlightItems.map((item) => {
            if (/** logic to check if in view region, use features */
                    item.absoluteInterval.start >= visData.visRegion.getContextCoordinates().start &&
                    item.absoluteInterval.end <= visData.visRegion.getContextCoordinates().end &&
                    item.active
                ) {
                item = this.recalculateHighlightItem(item);
                const style = item.highlightInterval ? {
                    left: item.highlightInterval.start + xOffset + "px",
                    top: y,
                    width: item.highlightInterval.getLength() + "px",
                    height,
                    backgroundColor: item.color,
                } : null;
                const className = highlightEnteredRegion ? "HighlightRegion-box" : "HighlightRegion-none";
                return (
                    <div className={className} key={item.absoluteInterval.toString()} style={style} />
                );
            } else {
                return null;
            }
        });

        return (
            <div
                style={{position: "relative", overflow: "hidden"}}
            >
                {theBoxes}
                {children}
            </div>
        );
    }
}

export default connect(mapStateToProps, callbacks)(withTrackLegendWidth(HighlightRegion));