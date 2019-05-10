import React from 'react';
import { AnnotationTrackConfig } from './AnnotationTrackConfig';

import BamSource from '../../dataSources/BamSource';
import { BamAlignment } from '../../model/BamAlignment';
import { TrackModel } from '../../model/TrackModel';

import BamTrack from '../trackVis/bamTrack/BamTrack';
import { ColorConfig, BackgroundColorConfig } from '../trackContextMenu/ColorConfig';

export class BamTrackConfig extends AnnotationTrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions({
            mismatchColor: 'yellow',
            deletionColor: 'black',
            insertionColor: 'green',
        });
    }

    initDataSource() {
        return new BamSource(this.trackModel.url);
    }

    formatData(data: any[]) {
        return BamAlignment.makeBamAlignments(data);
    }

    getComponent() {
        return BamTrack;
    }

    getMenuComponents() {
        const menu = super.getMenuComponents();
        menu.splice(menu.findIndex(component => component === BackgroundColorConfig), 0, MismatchColorConfig);
        return menu;
    }
}

function MismatchColorConfig(props: any) {
    return <ColorConfig {...props} optionName="mismatchColor" label="Mismatched base color" />;
}
