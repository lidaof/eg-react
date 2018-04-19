import _ from 'lodash';
import BarElementFactory from './BarElementFactory';
import LinearDrawingModel from '../model/LinearDrawingModel';

/**
 * Data that BarPlotDesigner needs.
 */
export class BarPlotRecord {
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

    getLocus() {
        return this.locus;
    }

    getValue() {
        return this.value;
    }
}

/**
 * A designer of horizontal bar plots.  In addition to that, one can also retrieve a mapping from x coordinate to a
 * record at that location.  Currently only does a one-to-one mapping; if records overlap, the map will only get one
 * of them.
 * 
 * @author Silas Hsu
 */
export class BarPlotDesigner {
    /**
     * Configures a new instance.
     * 
     * @param {DisplayedRegionModel} viewRegion - region to visualize
     * @param {number} width - width to draw
     * @param {number} height - height of the highest bar
     * @param {BarElementFactory} barElementFactory - element generator that customizes the design
     */
    constructor(viewRegion, width, barElementFactory=new BarElementFactory()) {
        this._viewRegion = viewRegion;
        this._width = width;
        this._elementFactory = barElementFactory;
        this._xToDataMap = []; // We have this, because we will not be attaching mouse listeners to each bar
    }

    /**
     * Designs a bar plot visualization.  Returns an array of React elements that are valid <svg> elements.
     * 
     * @param {BarPlotRecord[]} data - data to visualize
     * @return {JSX.Element[]} array of React elements that are valid <svg> elements
     */
    design(data) {
        this._xToDataMap = [];
        if (data.length === 0) {
            return [];
        }
        const dataMin = _.minBy(data, record => record.getValue()).getValue();
        const dataMax = _.maxBy(data, record => record.getValue()).getValue();
        this._elementFactory.setDataMinMax(dataMin, dataMax);

        const drawModel = new LinearDrawingModel(this._viewRegion, this._width);
        const navContext = this._viewRegion.getNavigationContext();
        let elements = [];
        for (let record of data) {
            const absLocations = navContext.convertGenomeIntervalToBases(record.getLocus());
            for (let location of absLocations) {
                const x = Math.round(drawModel.baseToX(location.start));
                const width = Math.ceil(drawModel.basesToXWidth(location.getLength()));
                this._addToCoordinateMap(x, width, record);
                elements.push(this._elementFactory.drawOneRecord(record, x, width));
                //elements.push(this._elementFactory.drawBackground(x, width));

            }
        }
        return elements;
    }

    /**
     * Returns a mapping from x coordinate to BarPlotRecord, which was created by the most recent call to design().
     * 
     * @return {Object} mapping from x coordinate to BarPlotRecord
     */
    getCoordinateMap() {
        return this._xToDataMap;
    }
    
    /**
     * When designing the visualization, updates the coordinate map.
     * 
     * @param {number} xStart - start coordinate of the record
     * @param {number} xWidth - width the record occupies
     * @param {BarPlotRecord} record - the actual record to store in the coordinate map
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

export default BarPlotDesigner;
