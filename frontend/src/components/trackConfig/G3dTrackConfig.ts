import { TrackConfig } from "./TrackConfig";
import { G3dSource } from "../../dataSources/G3dSource";
import G3dTrack, { DEFAULT_OPTIONS } from "../trackVis/3d/G3dTrack";

import HeightConfig from "../trackContextMenu/HeightConfig";
import { BackgroundColorConfig } from "components/trackContextMenu/ColorConfig";
import TrackModel, { TrackOptions } from "../../model/TrackModel";
import {
  G3dResolutionConfig,
  G3dRegionConfig
} from "components/trackContextMenu/G3dDataConfig";

export class G3dTrackConfig extends TrackConfig {
  constructor(trackModel: TrackModel) {
    super(trackModel);
    this.setDefaultOptions({
      ...DEFAULT_OPTIONS
    });
  }

  initDataSource() {
    if (this.trackModel.fileObj) {
      return new G3dSource(this.trackModel.fileObj);
    } else {
      return new G3dSource(this.trackModel.url);
    }
  }

  /**
   * @override
   */
  shouldFetchBecauseOptionChange(
    oldOptions: TrackOptions,
    newOptions: TrackOptions
  ): boolean {
    return (
      oldOptions.region !== newOptions.region ||
      oldOptions.resolution !== newOptions.resolution
    );
  }

  getComponent() {
    return G3dTrack;
  }

  getMenuComponents() {
    const items = [
      G3dResolutionConfig,
      G3dRegionConfig,
      HeightConfig,
      BackgroundColorConfig
    ];

    return items;
  }
}
