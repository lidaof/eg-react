import TrackRenderer from './TrackRenderer';
import RulerTrack from '../trackVis/RulerTrack';

class RulerTrackRenderer extends TrackRenderer {
    getComponent() {
        return RulerTrack;
    }
}

export default RulerTrackRenderer;
