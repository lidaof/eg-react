import React from 'react';

import { withTrackLegendWidth } from '../withTrackLegendWidth';
import { SelectableGenomeArea } from '../SelectableGenomeArea';

import { ViewExpansion } from '../../model/RegionExpander';
import OpenInterval from '../../model/interval/OpenInterval';

interface ZoomableTrackContainerProps {
    trackElements: JSX.Element[]; // Track elements to render
    visData: ViewExpansion; // Track visualization config
    legendWidth: number;

    /**
     * Callback for when a region is selected.
     * 
     * @param {number} start - context coordinate of the start of the new region
     * @param {number} end - context coordinate of the end of the new region
     */
    onNewRegion?(start: number, end: number): void;
}

/**
 * A track container that allows selecting and zooming into a region
 * 
 * @param {ZoomableTrackContainerProps} props 
 * @return {JSX.Element} the element to render
 * @author Silas Hsu
 */
function UnconnectedZoomableTrackContainer(props: ZoomableTrackContainerProps): JSX.Element {
    const {trackElements, visData, legendWidth, onNewRegion} = props;
    const {viewWindowRegion, viewWindow} = visData;
    return (
    <SelectableGenomeArea
        selectableRegion={viewWindowRegion}
        dragLimits={new OpenInterval(legendWidth, legendWidth + viewWindow.getLength())}
        onRegionSelected={onNewRegion}
    >
        {trackElements}
    </SelectableGenomeArea>
    );
}

export const ZoomableTrackContainer = withTrackLegendWidth(UnconnectedZoomableTrackContainer);
