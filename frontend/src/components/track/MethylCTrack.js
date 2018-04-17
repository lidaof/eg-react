import BigWigTrack from './BigWigTrack';
import { BarPlotRecord } from '../../art/BarPlotDesigner';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';
import TabixSource from '../../dataSources/TabixSource';

function convertToBarPlotRecords(data) {
    console.log(data);
    return data.map(record =>
        new BarPlotRecord(new ChromosomeInterval(record.chr, record.start, record.end), Number(record.details))
    );
}

const MethylCTrack = {
    visualizer: BigWigTrack.visualizer,
    legend: BigWigTrack.legend,
    menuItems: BigWigTrack.menuItems,
    defaultOptions: BigWigTrack.defaultOptions,
    getDataSource: trackModel => new TabixSource(trackModel.url),
    processData: convertToBarPlotRecords,
};

export default MethylCTrack;
