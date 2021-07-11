import memoizeOne from "memoize-one";
import Smooth from "array-smooth";
import { DefaultAggregators, FeatureAggregator } from "model/FeatureAggregator";
import { ScaleChoices } from "model/ScaleChoices";
import { DEFAULT_OPTIONS } from "./NumericalTrack";

/*
separate aggregate function out
*/

export class NumericalAggregator {
    constructor() {
        this.aggregateFeatures = memoizeOne(this.aggregateFeatures);
    }

    aggregateFeatures(data, viewRegion, width, aggregatorId) {
        const aggregator = new FeatureAggregator();
        const xToFeatures = aggregator.makeXMap(data, viewRegion, width);
        return xToFeatures.map(DefaultAggregators.fromId(aggregatorId));
    }

    xToValueMaker(data, viewRegion, width, options) {
        const withDefaultOptions = Object.assign({}, DEFAULT_OPTIONS, options);
        const { aggregateMethod, smooth, yScale, yMin } = withDefaultOptions;
        let xToValue2BeforeSmooth,
            xToValue,
            xToValue2,
            hasReverse = false;
        if(data){
            const dataForward = data.filter((feature) => feature.value === undefined || feature.value >= 0); // bed track to density mode
            const dataReverse = data.filter((feature) => feature.value < 0);
            if (dataReverse.length) {
                xToValue2BeforeSmooth = this.aggregateFeatures(dataReverse, viewRegion, width, aggregateMethod);
            } else {
                xToValue2BeforeSmooth = [];
            }
            const smoothNumber = Number.parseInt(smooth) || 0;
            xToValue2 = smoothNumber === 0 ? xToValue2BeforeSmooth : Smooth(xToValue2BeforeSmooth, smoothNumber);
            const xValues2 = xToValue2.filter((x) => x);
            if (xValues2.length && (yScale === ScaleChoices.AUTO || (yScale === ScaleChoices.FIXED && yMin < 0))) {
                hasReverse = true;
            }
            const xToValueBeforeSmooth =
            dataForward.length > 0 ? this.aggregateFeatures(dataForward, viewRegion, width, aggregateMethod) : [];
            xToValue = smoothNumber === 0 ? xToValueBeforeSmooth : Smooth(xToValueBeforeSmooth, smoothNumber);
        }
        return [xToValue, xToValue2, hasReverse];
    }
}
