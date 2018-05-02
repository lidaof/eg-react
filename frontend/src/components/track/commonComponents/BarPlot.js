import React from 'react'
import PropTypes from 'prop-types';
import _ from 'lodash';

import HoverTooltipContext from './tooltip/HoverTooltipContext';
import ErrorMessage from '../../ErrorMessage';

import DesignRenderer from '../../../art/DesignRenderer';
import BarRecord from '../../../model/BarRecord';

const RENDER_LIMIT = 30000;

/**
 * Component that renders a bar chart graphic.
 * 
 * @author Silas Hsu
 */
class BarPlot extends React.PureComponent {
    static propTypes = {
        /**
         * Data to display: 2D array of BarRecords.  The first dimension is the x coordinate.  The second dimension is
         * a list of BarRecords at that location.  In other words, this functions as a x-to-data map
         */
        data: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.instanceOf(BarRecord))).isRequired,
        width: PropTypes.number.isRequired, // Graphic width
        height: PropTypes.number.isRequired, // Graphic height
        style: PropTypes.object, // CSS
        htmlType: PropTypes.number, // Actual type of HTML element to render.  See DesignRenderer.js

        /**
         * Callback for getting a bar element to render.  Signature (record: BarRecord): JSX.Element
         * The `record.originalData` may or may not contain the original numerical feature; it depends on the data
         * aggregator.
         */
        getBarElement: PropTypes.func.isRequired,
        /**
         * Called when the user mouses over the graphic.  Should return tooltip contents to render.  Signature
         *     (relativeX: number, records: BarPlotRecord[]): JSX.Element
         *         `relativeX`: the x coordinate of the mouse hover, relative to the left of the container
         *         `records`: all records at this x location.  May be an empty array.
         */
        getTooltipContents: PropTypes.func,
    };

    static defaultProps = {
        getTooltipContents: (relativeX, records) => null
    };

    /**
     * Binds event listeners.
     * 
     * @param {Object} props - props as specified by React
     */
    constructor(props) {
        super(props);
        this.getTooltipContents = this.getTooltipContents.bind(this);
    }

    /**
     * 
     * @param {*} event 
     * @return {JSX.Element}
     */
    getTooltipContents(relativeX) {
        const records = this.props.data[Math.round(relativeX)] || [];
        return this.props.getTooltipContents(relativeX, records);
    }

    /**
     * @inheritdoc
     */
    render() {
        const {data, width, height, style, htmlType, getBarElement} = this.props;
        const numDataPoints = _.sumBy(data, 'length');
        if (numDataPoints > RENDER_LIMIT) {
            return (
            <ErrorMessage width={width} height={height}>
                Refusing to render excessive nuumber of items ({numDataPoints})
            </ErrorMessage>
            );
        }

        let barElements = [];
        for (let recordArray of data) {
            for (let record of recordArray) {
                if (record.value) {
                    barElements.push(getBarElement(record))
                }
            }
        }

        return (
        <HoverTooltipContext tooltipRelativeY={height} getTooltipContents={this.getTooltipContents} >
            <DesignRenderer
                type={htmlType}
                width={width}
                height={height}
                style={style}
            >
                {barElements}
            </DesignRenderer>
        </HoverTooltipContext>
        );
    }
}

export default BarPlot;
