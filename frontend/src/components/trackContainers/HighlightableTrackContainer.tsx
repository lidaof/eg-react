import React from 'react';

import { withTrackLegendWidth } from '../withTrackLegendWidth';
import { SelectableGenomeArea } from '../SelectableGenomeArea';
import { HighlightItemProps } from './HighlightMenu';

import { ViewExpansion } from '../../model/RegionExpander';
import OpenInterval from '../../model/interval/OpenInterval';
import { connect } from 'react-redux';
import { AppState, ActionCreators } from 'AppState';
import { StateWithHistory } from 'redux-undo';
import ChromosomeInterval from 'model/interval/ChromosomeInterval';
import DisplayedRegionModel from 'model/DisplayedRegionModel';

interface HighlightableTrackContainerProps {
    trackElements: JSX.Element[]; // Track elements to render
    visData: ViewExpansion; // Track visualization config
    viewRegion: DisplayedRegionModel;
    legendWidth: number;
    highligthItems: HighlightItemProps[],

    /**
     * Callback for when a region is selected.
     * 
     * @param {number} start - context coordinate of the start of the new region
     * @param {number} end - context coordinate of the end of the new region
     */
    onNewHighlight?(start: number, end: number): void;
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
 * A track container that allows selecting and zooming into a region
 * 
 * @param {HighlightableTrackContainerProps} props 
 * @return {JSX.Element} the element to render
 * @author Silas Hsu
 */
function UnconnectedHighlightableTrackContainer(props: HighlightableTrackContainerProps): JSX.Element {
    const {trackElements, visData, legendWidth, viewRegion, onNewHighlight} = props;
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

const HighlightableTrackContainer = withTrackLegendWidth(UnconnectedHighlightableTrackContainer);

export default connect(mapStateToProps, callbacks)(HighlightableTrackContainer);
