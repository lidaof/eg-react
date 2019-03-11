import MatplotSource from '../../dataSources/MatplotSource';
import MatplotTrack from '../trackVis/commonComponents/numerical/MatplotTrack';
import { TrackConfig } from './TrackConfig';

export class MatplotTrackConfig extends TrackConfig {
    initDataSource() {
        return new MatplotSource(this.trackModel);
    }

    getComponent() {
        return MatplotTrack;
    }
}
