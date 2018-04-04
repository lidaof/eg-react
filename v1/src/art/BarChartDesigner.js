import React from 'react';
import _ from 'lodash';
import LinearDrawingModel from '../model/LinearDrawingModel';

const DEFAULT_OPTIONS = {
    color: "blue"
};

/**
 * Designer for a bar chart visualization.
 * 
 * @author Silas Hsu
 */
class BarChartDesigner {
    /**
     * Configures a new instance.
     * 
     * @param {DisplayedRegionModel} viewRegion - region to visualize
     * @param {BarChartRecord[]} data - data to visualize
     * @param {number} width - width to draw; x coordinate of the rightmost bar
     * @param {number} height - height of the highest bar
     * @param {Object} options - drawing options
     */
    constructor(viewRegion, data, width, height, options=DEFAULT_OPTIONS) {
        this.width = width;
        this.height = height;
        this.viewRegion = viewRegion;
        this.data = data;
        this.options = options;
        this._xToDataMap = [];
    }

    /**
     * Designs a bar chart visualization.  Returns an array of React elements that are valid <svg> elements.
     * 
     * @return {JSX.Element[]} array of React elements that are valid <svg> elements
     */
    design() {
        this._xToDataMap = [];
        const non0Data = this.data.filter(record => record.value !== 0);
        if (non0Data.length === 0) {
            return [];
        }
        const dataMax = _.maxBy(this.data, record => record.value).value;
        
        const drawModel = new LinearDrawingModel(this.viewRegion, this.width);
        const navContext = this.viewRegion.getNavigationContext();
        let elements = [];
        for (let record of non0Data) {
            const absLocations = navContext.convertGenomeIntervalToBases(record.locus);
            for (let location of absLocations) {
                const x = Math.round(drawModel.baseToX(location.start));
                const y = Math.round(this.height - (record.value/dataMax * this.height));
                const width = Math.ceil(drawModel.basesToXWidth(location.getLength()));
                const height = Math.round(record.value/dataMax * this.height);
                this._addToCoordinateMap(x, width, record);
                elements.push(<rect key={x} x={x} y={y} width={width} height={height} fill={this.options.color} />);
            }
        }
        return elements;
    }

    /**
     * Returns a mapping from x coordinate to BarChartRecord, created by the most recent call to design().
     * 
     * @return {Object} mapping from x coordinate to BarChartRecord
     */
    getCoordinateMap() {
        return this._xToDataMap;
    }

    /**
     * When designing the visualization, updates the coordinate map.
     * 
     * @param {number} xStart - 
     * @param {number} xWidth 
     * @param {BarChartRecord} record 
     */
    _addToCoordinateMap(xStart, xWidth, record) {
        const xEnd = xStart + xWidth
        for (let x = xStart; x < xEnd; x++) {
            const existingRecord = this._xToDataMap[x];
            if (!existingRecord || record.value > existingRecord.value) {
                this._xToDataMap[x] = record;
            }
        }
    }
}

/**
 * Data that BarChartDesigner requires.
 */
export class BarChartRecord {
    /**
     * Makes a new instance.
     * 
     * @param {ChromosomeInterval} locus - genomic location
     * @param {number} value - value at the location
     */
    constructor(locus, value) {
        this.locus = locus;
        this.value = value;
    }
}

export default BarChartDesigner;
