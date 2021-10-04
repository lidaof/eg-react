import React from 'react';

import { withTrackLegendWidth } from '../withTrackLegendWidth';
import { SelectableGenomeArea } from '../SelectableGenomeArea';

import { ViewExpansion } from '../../model/RegionExpander';
import OpenInterval from '../../model/interval/OpenInterval';

interface HighlightableTrackContainerProps {
    trackElements: JSX.Element[]; // Track elements to render
    visData: ViewExpansion; // Track visualization config
    legendWidth: number;

    /**
     * Callback for when a region is selected.
     * 
     * @param {number} start - context coordinate of the start of the new region
     * @param {number} end - context coordinate of the end of the new region
     */
    onNewHighlight?(start: number, end: number): void;
}

/**
 * A track container that allows selecting and zooming into a region
 * 
 * @param {HighlightableTrackContainerProps} props 
 * @return {JSX.Element} the element to render
 * @author Silas Hsu
 */
function UnconnectedHighlightableTrackContainer(props: HighlightableTrackContainerProps): JSX.Element {
    const {trackElements, visData, legendWidth, onNewHighlight} = props;
    const {viewWindowRegion, viewWindow} = visData;
    return (
    <SelectableGenomeArea
        selectableRegion={viewWindowRegion}
        dragLimits={new OpenInterval(legendWidth, legendWidth + viewWindow.getLength())}
        onRegionSelected={onNewHighlight}
    >
        {trackElements}
    </SelectableGenomeArea>
    );
}

export const ZoomableTrackContainer = withTrackLegendWidth(UnconnectedHighlightableTrackContainer);
