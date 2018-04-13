import BigWigTrack from './BigWigTrack';
import { BarPlotRecord } from '../../art/BarPlotDesigner';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';
import BedSource from '../../dataSources/BedSource';

function convertToBarPlotRecords(data) {
    return data.map(record =>
        new BarPlotRecord(new ChromosomeInterval(record.chr, record.start, record.end), Number(record.details))
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
