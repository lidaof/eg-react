import React from 'react';

import './HighlightRegion.css';
import OpenInterval from '../model/interval/OpenInterval';
import LinearDrawingModel from '../model/LinearDrawingModel';
import { withTrackLegendWidth } from './withTrackLegendWidth';
import { ViewExpansion } from '../model/RegionExpander';

interface HighlightRegionProps {
    y?: number | string; // Relative Y of the top of the selection box; how far from the top of this container
    height?: number | string; // Height of the selection box
    enteredRegion: OpenInterval;
    highlightEnteredRegion: boolean;
    visData: ViewExpansion;
    legendWidth: number;
    xOffset: number;
}

/**
 * Creates and manages the boxes that the user can drag across the screen to select a new region.
 * 
 * @author Silas Hsu
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
    };

    /**
     * Initializes state, binds event listeners, and attaches a keyboard listener to the window, which will listen for
     * requests to cancel a selection.
     * 
     * @param {Object} props - props as specified by React
     */
    constructor(props: HighlightRegionProps) {
        super(props);
    }

    getHiglightedXs(xSpan: OpenInterval): OpenInterval {
        const {legendWidth} = this.props;
        const {viewWindowRegion, viewWindow} = this.props.visData;
        const drawModel = new LinearDrawingModel(viewWindowRegion, viewWindow.getLength());
        const xRegion = drawModel.baseSpanToXSpan(xSpan);
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
        const {height, y, children, enteredRegion, highlightEnteredRegion, xOffset } = this.props;
        const highlight = enteredRegion ? this.getHiglightedXs(enteredRegion) : null;
        const style = highlight ? {
            left: highlight.start + xOffset + "px",
            top: y,
            width: highlight.getLength() + "px",
            height
        } : null;
        const className = highlightEnteredRegion ? "HighlightRegion-box" : "HighlightRegion-none";
        const theBox = <div className={className} style={style} />;
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

export default withTrackLegendWidth(HighlightRegion);