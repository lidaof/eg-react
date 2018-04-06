import React from 'react';
import { scaleLinear } from 'd3-scale';

/**
 * Class that customizes the design output by BarPlotDesigner.
 * 
 * @author Silas Hsu
 */
export class BarElementFactory {
    /**
     * Called with the data's max and min values.  It is called before BarPlotDesigner starts drawing; use this method
     * to prepare.
     * 
     * @param {number} min - minimum value of the data
     * @param {number} max - maximum value of the data
     */
    setDataMinMax(min, max) {

    }

    /**
     * Gets the visualization for one record.
     * 
     * @param {BarPlotRecord} record - the record to draw
     * @param {number} x - x coordinate to draw
     * @param {number} width - width to draw
     * @return {JSX.Element} - visualization for one record
     */
    drawOneRecord(record, x, width) {

    }
}

/**
 * Simple bar chart drawer.  Records given to BarPlotDesigner must implement BarPlotRecord.
 * 
 * @author Silas Hsu
 */
export class SimpleBarElementFactory extends BarElementFactory {
    /**
     * Makes a new instance.  Options schema:
     *  - `color` - the color to draw
     * 
     * @param {number} height - max height of bars
     * @param {Object} options - drawing options
     */
    constructor(height, options) {
        super();
        this._height = height;
        this._options = options || {};
        this._valueToY = null;
    }

    /**
     * @inheritdoc
     */
    setDataMinMax(min, max) {
        this._valueToY = scaleLinear().domain([max, min]).range([0, this._height]);
    }

    /**
     * @inheritdoc
     */
    drawOneRecord(record, x, width) {
        const y = this._valueToY(record.getValue());
        const drawHeight = this._height - y;
        if (drawHeight <= 0) {
            return null;
        }
        return <rect key={x} x={x} y={y} width={width} height={drawHeight} fill={this._options.color} />;
    }
}

/**
 * Draws records that may have different categories.  Records given to BarPlotDesigner must implement BarPlotRecord, as
 * well as have a `getCategoryId()` method.
 * 
 * @author Silas Hsu
 */
export class CategoricalBarElementFactory extends BarElementFactory {
    /**
     * Makes a new instance.  Options schema:
     *  - `categoryColors` - mapping from category id to color
     * 
     * @param {number} height - max height of bars
     * @param {Object} options - drawing options
     */
    constructor(height, options) {
        super();
        this._options = options;
        this.simpleFactory = new SimpleBarElementFactory(height, options);
    }

    /**
     * @inheritdoc
     */
    setDataMinMax(min, max) {
        this.simpleFactory.setDataMinMax(min, max);
    }

    /**
     * @inheritdoc
     */
    drawOneRecord(record, x, width) {
        const categoryId = record.getCategoryId();
        const color = this._options.categoryColors[categoryId];
        const element = this.simpleFactory.drawOneRecord(record, x, width);
        if (!element) {
            return null;
        }
        return React.cloneElement(element, {
            fill: color
        });
    }
}

export default BarElementFactory;
