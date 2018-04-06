import React from 'react';
import PropTypes from 'prop-types';
import SelectableArea from './SelectableArea';
import { MIN_VIEW_REGION_SIZE } from '../AppState';
import LinearDrawingModel from '../model/LinearDrawingModel';
import './SelectableArea.css';

/**
 * A SelectableArea, but also displays the selected length in base pairs, and puts a limit on the selected size.
 * 
 * @author Silas Hsu
 */
class SelectableGenomeArea extends React.PureComponent {
    static propTypes = {
        /**
         * Draw model, required to calculate how many base pairs have been selected.
         */
        drawModel: PropTypes.instanceOf(LinearDrawingModel).isRequired, 
        y: PropTypes.string, // See SelectableArea docs
        height: PropTypes.string, // See SelectableArea docs
        onAreaSelected: PropTypes.func, // See SelectableArea docs
    };

    /**
     * @param {number} bases - number of bases
     * @return {string} human-readable string representing that number of bases
     */
    numBasesToString(bases) {
        const rounded = Math.floor(bases);
        if (rounded >= 750000) {
            return `${(rounded/1000000).toFixed(1)}Mb`;
        } else if (rounded >= 10000) {
            return `${(rounded/1000).toFixed(1)}kb`;
        } else {
            return `${rounded}bp`;
        }
    }

    render() {
        const {y, height, drawModel, onAreaSelected, children} = this.props;
        const getIsWidthSelectable = width => drawModel.xWidthToBases(width) >= MIN_VIEW_REGION_SIZE;
        const getInnerElement = width => (
            <div className="SelectableArea-box-text-container" >
                <h4 style={{margin: 0}} >{this.numBasesToString(drawModel.xWidthToBases(width))}</h4>
                <p className="SelectableArea-box-secondary-text" >
                    {getIsWidthSelectable(width) ? "Esc to cancel" : "Too small"}
                </p>
            </div>
        );

        return (
        <SelectableArea
            y={y}
            height={height}
            getInnerElement={getInnerElement}
            getIsWidthSelectable={getIsWidthSelectable}
            onAreaSelected={onAreaSelected}
        >
            {children}
        </SelectableArea>
        );
    }
}

export default SelectableGenomeArea;
