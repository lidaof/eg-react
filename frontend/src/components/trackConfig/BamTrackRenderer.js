import AnnotationTrackRenderer from './AnnotationTrackRenderer';
import { configStaticDataSource } from './configDataFetch';
import BedTrack from '../trackVis/bedTrack/BedTrack';

import BamSource from '../../dataSources/BamSource';
import BamRecord from '../../model/BamRecord';

const withDataFetch = configStaticDataSource(props => new BamSource(props.trackModel.url), BamRecord.makeBamRecords);
const BamTrackWithData = withDataFetch(BedTrack);

class BamTrackRenderer extends AnnotationTrackRenderer {
    getComponent() {
        return BamTrackWithData;
    }
}

export default BamTrackRenderer;
