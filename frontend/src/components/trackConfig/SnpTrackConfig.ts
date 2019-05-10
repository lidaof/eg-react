import { AnnotationTrackConfig } from './AnnotationTrackConfig';
import { TrackModel } from '../../model/TrackModel';
import {SnpTrack, DEFAULT_OPTIONS } from '../trackVis/SnpTrack/SnpTrack';
import SnpSource from '../../dataSources/SnpSource';
import Snp from '../../model/Snp';

export class SnpTrackConfig extends AnnotationTrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS);
    }

    initDataSource() {
        return new SnpSource(this.trackModel);
    }

    formatData(data: any[]) {
        return data.map(record => new Snp(record));
    }

    getComponent() {
        return SnpTrack;
    }
}
