import { TrackConfig } from './TrackConfig';
import RulerTrack from '../trackVis/RulerTrack';

export class RulerTrackConfig extends TrackConfig {
    getComponent(): typeof RulerTrack {
        return RulerTrack;
    }
}
