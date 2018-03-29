import React from 'react';
import _ from 'lodash';
import LinearDrawingModel from '../model/LinearDrawingModel';

const DEFAULT_OPTIONS = {
    color: "blue"
};

/**
 * Designer for a bar chart visualization.
 */
class BarChartDesigner {
    /**
     * Configures a new instance.
     * 
     * @param {DisplayedRegionModel} viewRegion - region to visualize
     * @param {BigWigSource~Record[]} data - data to visualize
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
    }

    /**
     * Designs a bar chart visualization.  Returns an array of React components that are valid <svg> elements.
     * 
     * @return {React.Component[]} array of React components that are valid <svg> elements
     */
    design() {
        const non0Data = this.data.filter(record => record.value !== 0);
        if (non0Data.length === 0) {
            return [];
        }
        const dataMax = Math.max(...non0Data.map(record => record.value));
        
        const drawModel = new LinearDrawingModel(this.viewRegion, this.width);
        return non0Data.map((record, index) => {
            const x = Math.round(drawModel.baseToX(record.start));
            const y = Math.round(this.height - (record.value/dataMax * this.height));
            const height = Math.round(record.value/dataMax * this.height);
            return <rect key={index} x={x} y={y} width={1} height={height} fill={this.options.color} />;
        });
    }
}

export default BarChartDesigner;
