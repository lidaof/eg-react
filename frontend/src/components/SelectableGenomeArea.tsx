import React from 'react';
import { SelectableArea } from './SelectableArea';
import { MIN_VIEW_REGION_SIZE } from '../AppState';

import OpenInterval from '../model/interval/OpenInterval';
import DisplayedRegionModel from '../model/DisplayedRegionModel';
import LinearDrawingModel from '../model/LinearDrawingModel';
import { niceBpCount } from '../util';

import './SelectableArea.css';

interface SelectableGenomeAreaProps {
    selectableRegion: DisplayedRegionModel; // The region to undergo selection
    dragLimits: OpenInterval; // Drawing limits of the selection box
    y?: number | string; // Relative Y of the top of the selection box; how far from the top of this container
    height?: number | string; // Height of the selection box

    /**
     * Callback for when a region is selected.
     * 
     * @param {number} start - context coordinate of the start of the new region
     * @param {number} end - context coordinate of the end of the new region
     */
    onRegionSelected?(start: number, end: number): void;
}

/**
 * A SelectableArea, but also displays the selected length in base pairs, and puts a limit on the selected size.
 * 
 * @author Silas Hsu
 */
export class SelectableGenomeArea extends React.PureComponent<SelectableGenomeAreaProps> {
    constructor(props: SelectableGenomeAreaProps) {
        super(props);
        this.getBoxCaption = this.getBoxCaption.bind(this);
        this.getIsAreaValid = this.getIsAreaValid.bind(this);
        this.handleAreaSelect = this.handleAreaSelect.bind(this);
    }

    getSelectedBases(xSpan: OpenInterval): OpenInterval {
        const {selectableRegion, dragLimits} = this.props;
        const navContext = selectableRegion.getNavigationContext();
        const drawModel = new LinearDrawingModel(selectableRegion, dragLimits.getLength());
        return new OpenInterval(xToBase(xSpan.start), xToBase(xSpan.end));

        function xToBase(x: number) {
            x -= dragLimits.start;
            const rawBase = drawModel.xToBase(x);
            return navContext.toGaplessCoordinate( Math.round(rawBase) );
        }
    }

    getIsBaseSpanValid(baseSpan: OpenInterval): boolean {
        return baseSpan.getLength() >= MIN_VIEW_REGION_SIZE;
    }

    getIsAreaValid(xSpan: OpenInterval): boolean {
        return this.getIsBaseSpanValid(this.getSelectedBases(xSpan));
    }

    getBoxCaption(xSpan: OpenInterval): JSX.Element {
        const baseSpan = this.getSelectedBases(xSpan);
        return (
        <div className="SelectableArea-box-text-container" >
            <h4 style={{margin: 0}} >{niceBpCount(baseSpan.getLength())}</h4>
            <p className="SelectableArea-box-secondary-text" >
                {this.getIsBaseSpanValid(baseSpan) ? "Esc to cancel" : "Too small"}
            </p>
        </div>
        );
    }

    handleAreaSelect(xSpan: OpenInterval) {
        const baseSpan = this.getSelectedBases(xSpan);
        if (this.getIsBaseSpanValid(baseSpan)) {
            this.props.onRegionSelected(baseSpan.start, baseSpan.end);
        }
    }

    render(): JSX.Element {
        const {dragLimits, y, height, children} = this.props;

        return (
        <SelectableArea
            y={y}
            height={height}
            dragLimits={dragLimits}
            getInnerElement={this.getBoxCaption}
            getIsAreaValid={this.getIsAreaValid}
            onAreaSelected={this.handleAreaSelect}
        >
            {children}
        </SelectableArea>
        );
    }
}
