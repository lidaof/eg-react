import React from 'react';
import _ from 'lodash';
import LinearDrawingModel from '../model/LinearDrawingModel';

const DEFAULT_OPTIONS = {
    color: "blue"
};

/**
 * Designer for a bar chart visualization.
 */
class RmskChartDesigner {
    /**
     * Configures a new instance.
     * 
     * @param {DisplayedRegionModel} viewRegion - region to visualize
     * @param {RMsk~Record[]} data - data to visualize
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
        if (this.data.length === 0) {
            return [];
        }
        //const dataMax = Math.max(...this.data.map(record => record.oneMinusDivergence));
        const dataMax = _.maxBy(this.data, record => record.oneMinusDivergence).oneMinusDivergence;
        console.log(this.data.length);
        
        const drawModel = new LinearDrawingModel(this.viewRegion, this.width);
        return this.data.map((record, index) => {
            //console.log(record);
            const baseX = this.viewRegion.getNavigationContext().convertGenomeIntervalToBases(record.getLocus());
            const x = Math.round(drawModel.baseToX(baseX.start));
            const y = Math.round(this.height - (record.oneMinusDivergence/dataMax * this.height));
            const height = Math.round(record.oneMinusDivergence/dataMax * this.height);
            const width = drawModel.basesToXWidth(record.getLength());
            const [repClassDesc, color] = this.options.color[this.options.category[record.repClass]]
            //console.log(repClassDesc, color, height, width, x, y);
            return <rect key={index} x={x} y={y} width={width} height={height} fill={color} />;
        });
    }
}

export default RmskChartDesigner;
