import { AnnotationTrackConfig } from './AnnotationTrackConfig';
import GeneAnnotationTrack from '../trackVis/geneAnnotationTrack/GeneAnnotationTrack';
import { DEFAULT_OPTIONS } from '../trackVis/geneAnnotationTrack/GeneAnnotation';
import GeneSource from '../../dataSources/GeneSource';
import Gene from '../../model/Gene';
import { TrackModel } from '../../model/TrackModel';

export class GeneAnnotationTrackConfig extends AnnotationTrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS);
    }

    initDataSource() {
        return new GeneSource(this.trackModel);
    }

    formatData(data: any[]) {
        return data.map(record => new Gene(record));
    }

    getComponent() {
        return GeneAnnotationTrack;
    }
}
