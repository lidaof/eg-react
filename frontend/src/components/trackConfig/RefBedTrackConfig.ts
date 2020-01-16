import WorkerSource from '../../dataSources/worker/WorkerSource';
import { BedWorker } from '../../dataSources/WorkerTSHook';
import BedRecord from '../../dataSources/bed/BedRecord';
import { AnnotationTrackConfig } from './AnnotationTrackConfig';
import GeneAnnotationTrack from '../trackVis/geneAnnotationTrack/GeneAnnotationTrack';
import { DEFAULT_OPTIONS } from '../trackVis/geneAnnotationTrack/GeneAnnotation';
import Gene, { IdbRecord } from '../../model/Gene';
import { TrackModel } from '../../model/TrackModel';
import LocalBedSource from '../../dataSources/LocalBedSource';
import BedTextSource from '../../dataSources/BedTextSource';

export class RefBedTrackConfig extends AnnotationTrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS);
    }

    initDataSource() {
        if (this.trackModel.isText) {
            return new BedTextSource({
                url: this.trackModel.url,
                blob: this.trackModel.fileObj,
                textConfig: this.trackModel.textConfig
            });
        } else {
            if (this.trackModel.files.length > 0) {
                return new LocalBedSource(this.trackModel.files);
            } else {
                return new WorkerSource(BedWorker, this.trackModel.url);
            }
        }
    }

    /**
     * Converts raw bed records to NumericalFeatures.  If we cannot parse a numerical value from a
     * record, the resulting NumericalFeature will have a value of 0.
     *
     * 3: "52313844"
     * 4: "52317097"
     * 5: "+"
     * 6: "Evx1"
     * 7: "ENSMUST00000031787.7"
     * 8: "coding"
     * 9: "52313498,52315738,52316533,"
     * 10: "52314271,52315994,52318378,"
     * 11: "Mus musculus even-skipped homeobox 1 (Evx1), mRNA."
     * chr: "chr6"
     * end: 52318378
     * start: 52313498
     *
     * @param {Object[]} data - BED records
     * @return {Gene[]} Genes
     */
    formatData(data: BedRecord[]) {
        return data.map(record => {
            const refBedRecord = {} as IdbRecord;
            refBedRecord.chrom = record.chr;
            refBedRecord.txStart = record.start;
            refBedRecord.txEnd = record.end;
            refBedRecord.id = record[7];
            refBedRecord.name = record[6];
            refBedRecord.description = record[11] ? record[11] : '';
            refBedRecord.transcriptionClass = record[8];
            refBedRecord.exonStarts = record[9];
            refBedRecord.exonEnds = record[10];
            refBedRecord.cdsStart = Number.parseInt(record[3], 10);
            refBedRecord.cdsEnd = Number.parseInt(record[4], 10);
            refBedRecord.strand = record[5];
            return new Gene(refBedRecord);
        });
    }

    getComponent() {
        return GeneAnnotationTrack;
    }
}
