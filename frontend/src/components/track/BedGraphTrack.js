import BigWigTrack from './BigWigTrack';
import { BarPlotRecord } from '../../art/BarPlotDesigner';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';
import BedSource from '../../dataSources/BedSource';

/**
 * Converts raw records from BedSource to BarPlotRecords.  The array returned by this function will appear as the `data`
 * prop of the legend and visualizer.
 * 
 * @param {Object[]} data - raw, plain-object records
 * @return {BarPlotRecord[]} BarPlotRecords to draw
 */
function convertToBarPlotRecords(data) {
    return data.map(record =>
        new BarPlotRecord(new ChromosomeInterval(record.chr, record.start, record.end), Number(record[3]))
    );
}

const BedGraphTrack = {
    visualizer: BigWigTrack.visualizer,
    legend: BigWigTrack.legend,
    menuItems: BigWigTrack.menuItems,
    defaultOptions: BigWigTrack.defaultOptions,
    getDataSource: trackModel => new BedSource(trackModel.url),
    processData: convertToBarPlotRecords,
};

export default BedGraphTrack;
