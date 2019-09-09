import { TrackConfig } from './TrackConfig';
import { G3dSource } from '../../dataSources/G3dSource';
import G3dTrack from '../trackVis/3d/G3dTrack';

import HeightConfig from '../trackContextMenu/HeightConfig';
import { BackgroundColorConfig } from 'components/trackContextMenu/ColorConfig';

export class G3dTrackConfig extends TrackConfig {
    
    initDataSource() {
        if(this.trackModel.fileObj) {
            return new G3dSource(this.trackModel.fileObj);
        } else {
            return new G3dSource(this.trackModel.url);
        }
    }

    getComponent() {
        return G3dTrack;
    }

    getMenuComponents() {
        const items =  [HeightConfig, BackgroundColorConfig];
        
        return items;
    }
}
