import React from 'react';
import OpenInterval from '../model/interval/OpenInterval';
import LinearDrawingModel from '../model/LinearDrawingModel';
import { withTrackLegendWidth } from './withTrackLegendWidth';
import { ViewExpansion } from '../model/RegionExpander';
import ChromosomeInterval from '../model/interval/ChromosomeInterval';
import { HighlightInterval } from '../components/trackContainers/HighlightMenu';

import './HighlightRegion.css';

interface HighlightRegionProps {
    y?: number | string; // Relative Y of the top of the selection box; how far from the top of this container
    height?: number | string; // Height of the selection box
    visData: ViewExpansion; // contains data on chromosome start/stop, and window start/stop;
    legendWidth: number; // used in calculation for highlight;
    xOffset: number;
    viewRegion: ChromosomeInterval;
    highlights: HighlightInterval[];
}


/**
 * Creates a box that highlight user's entered region, from gene or region locator
 * 
 * @author Daofeng Li, modified from Silas Hsu
 */
class HighlightRegion extends React.PureComponent<HighlightRegionProps> {
    static defaultProps: HighlightRegionProps = {
        y: "0px",
        height: "100%",
        visData: null,
        legendWidth: 120,
        xOffset: 0,
        viewRegion: null,
        highlights: [],
    };


    /**
     * Initializes state, binds event listeners, and attaches a keyboard listener to the window, which will listen for
     * requests to cancel a selection.
     * 
     * @param {Object} props - props as specified by React
     */

    getHighlightedXs(interval: OpenInterval): OpenInterval {
        const { legendWidth, visData } = this.props;
        const { viewWindowRegion, viewWindow } = visData;
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
     * checks every HighlightItem in the highlightItems prop and renders those in the view region;
     * @returns container that has highlight elements in it
     * @inheritdoc
     */
    render(): JSX.Element {
        const { height, y, children, xOffset, highlights } = this.props;
        const xS = highlights.map(h => this.getHighlightedXs(new OpenInterval(h.start, h.end)));
        const theBoxes = highlights.map((item, idx) => {
            const style = {
                left: xS[idx].start + xOffset + "px",
                top: y,
                width: xS[idx].getLength() + "px",
                height,
                backgroundColor: item.color,
                display: item.display ? 'unset' : 'none',
            }
            return (
                <div key={idx} className="HighlightRegion-box" style={style} />
            );
        });
        return (
            <div
                style={{ position: "relative", overflow: "hidden" }}
            >
                {theBoxes}
                {children}
            </div>
        );
    }
}

export default withTrackLegendWidth(HighlightRegion);