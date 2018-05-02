import PropTypes from 'prop-types';
import LinearDrawingModel from './LinearDrawingModel';
import OpenInterval from './interval/OpenInterval';
import ChromosomeInterval from './interval/ChromosomeInterval';

/**
 * A locus and a value bundled together.  More of an interface than a class.
 * 
 * @author Silas Hsu
 */
export class /* (interface) */ NumericalFeature {
    static propType = PropTypes.shape({
        locus: PropTypes.instanceOf(ChromosomeInterval).isRequired,
        value: PropTypes.number
    });

    /**
     * Makes a new instance.
     * 
     * @param {ChromosomeInterval} locus - genetic location
     * @param {number} value - value at that location
     */
    constructor(locus, value) {
        this.locus = locus;
        this.value = value;
    }
}

/**
 * A ready-to-draw piece of data, presumably as a bar.  Contains x interval and a value in that interval.  What scale to
 * use, however, is up to the user of the data.
 * 
 * @author Silas Hsu
 */
export class BarRecord {
    /**
     * Makes a new instance.  If the second parameter is a NumericalFeature, the record's value will be inferred from it
     * and the feature will be saved in the `originalData` prop.
     * 
     * @param {OpenInterval} xLocation - range of x coordinates in which to draw
     * @param {NumericalFeature | number} data - value at the location
     */
    constructor(xLocation, data) {
        this.xLocation = xLocation;
        if (data.value !== undefined) { // Data is an object
            this.value = data.value;
            this.originalData = data;
        } else { // Data is a number (hopefully)
            this.value = data;
            this.originalData = null;
        }
    }

    /**
     * Makes an array of BarRecord from an array of NumericalFeature.
     * 
     * @param {NumericalFeature[]} features - data to convert
     * @param {DisplayedRegionModel} viewRegion - displayed region
     * @param {number} width - width of the element on which the BarRecords will be drawn
     * @return {BarRecord[]} drawing data
     */
    static fromNumericalFeatures(features, viewRegion, width) {
        const drawModel = new LinearDrawingModel(viewRegion, width);
        const navContext = viewRegion.getNavigationContext();

        let barRecords = [];
        for (let feature of features) {
            const absLocations = navContext.convertGenomeIntervalToBases(feature.locus);
            for (let location of absLocations) {
                const xLocation = new OpenInterval(
                    Math.floor(drawModel.baseToX(location.start)),
                    Math.ceil(drawModel.baseToX(location.end))
                );
                barRecords.push(new BarRecord(xLocation, feature));
            }
        }
        return barRecords;
    }
}

export default BarRecord;
