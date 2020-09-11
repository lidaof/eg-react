import React from 'react';
import { AnnotationTrackConfig } from './AnnotationTrackConfig';
import BamSource from '../../dataSources/BamSource';
import { BamAlignment } from '../../model/BamAlignment';
import { TrackModel } from '../../model/TrackModel';
import BamTrack from '../trackVis/bamTrack/BamTrack';
import { ColorConfig, BackgroundColorConfig, SecondaryColorConfig } from '../trackContextMenu/ColorConfig';
import { AnnotationDisplayModes } from 'model/DisplayModes';
import YscaleConfig from 'components/trackContextMenu/YscaleConfig';
import SmoothConfig from 'components/trackContextMenu/SmoothConfig';

export class BamTrackConfig extends AnnotationTrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions({
            mismatchColor: 'yellow',
            deletionColor: 'black',
            insertionColor: 'green',
            color: 'red',
            color2: 'blue',
            smooth: 0, // for density mode
        });
    }

    initDataSource() {
        if (this.trackModel.files.length > 0) {
            return new BamSource(this.trackModel.files);
        } else {
            return new BamSource(this.trackModel.url);
        }
    }

    formatData(data: any[]) {
        return BamAlignment.makeBamAlignments(data);
    }

    getComponent() {
        return BamTrack;
    }

    getMenuComponents() {
        const menu = super.getMenuComponents();
        if (this.getOptions().displayMode === AnnotationDisplayModes.FULL) {
            menu.splice(menu.findIndex(component => component === BackgroundColorConfig), 0, MismatchColorConfig);
        } else {
            menu.splice(menu.findIndex(component => component === SecondaryColorConfig), 1, YscaleConfig, SmoothConfig)
        }
        return menu;
    }
}

function MismatchColorConfig(props: any) {
    return <ColorConfig {...props} optionName="mismatchColor" label="Mismatched base color" />;
}
