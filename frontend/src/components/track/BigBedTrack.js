import BedTrack from './bedTrack/BedTrack';
import BigWigOrBedSource from '../../dataSources/BigWigOrBedSource';
import LinearDrawingModel from '../../model/LinearDrawingModel';
import Feature from '../../model/Feature';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';

/*
Example record from BigWigOrBedSource
DASFeature {
    label: "NR_037940",
    max: 27219880,
    min: 27202057,
    orientation: "-",
    score: 35336,
    segment: "chr7",
    type: "bigbed",
    _chromId: 19
}
*/
/**
 * From the raw data source records, filters out those too small to see.  Returns an object with keys `features`, which
 * are the parsed Features, and `numHidden`, the the number of features that were filtered out.
 * 
 * @param {DASFeature[]} records - raw records
 * @param {Object} trackProps - props passed to Track
 * @return {Object} object with keys `genes` and `numHidden`.  See doc above for details
 */
function processBedRecords(records, trackProps) {
    const drawModel = new LinearDrawingModel(trackProps.viewRegion, trackProps.width);
    const visibleRecords = records.filter(record => drawModel.basesToXWidth(record.max - record.min) >= 0.25);
    const features = visibleRecords.map(record => new Feature(
        record.label || "",
        new ChromosomeInterval(record.segment, record.min, record.max),
        record.orientation
    ));
    for (let i = 0; i < features.length; i++) {
        features[i].index = i;
    }
    return {
        features: features,
        numHidden: records.length - visibleRecords.length
    };
}

const BigBedTrack = Object.assign({}, BedTrack, {
    getDataSource: trackModel => new BigWigOrBedSource(trackModel.url),
    processData: processBedRecords,
});

export default BigBedTrack;
