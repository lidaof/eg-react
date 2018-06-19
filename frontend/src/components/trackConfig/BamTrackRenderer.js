import React from 'react';
import AnnotationTrackRenderer from './AnnotationTrackRenderer';
import { configStaticDataSource } from './configDataFetch';
import BamTrack from '../trackVis/bamTrack/BamTrack';
import BamSource from '../../dataSources/BamSource';
import { BamRecord } from '../../model/BamRecord';
import { ColorConfig, BackgroundColorConfig } from '../trackContextMenu/ColorConfig';

const withDataFetch = configStaticDataSource(props => new BamSource(props.trackModel.url), BamRecord.makeBamRecords);
const BamTrackWithData = withDataFetch(BamTrack);
// TODO move bam source to webworker and stop renderer bam track for excessively large regions

class BamTrackRenderer extends AnnotationTrackRenderer {
    constructor(trackModel) {
        super(trackModel);
        this.setDefaultOptions({
            mismatchColor: 'yellow',
            deletionColor: 'black',
            insertionColor: 'green'
        });
    }

    getComponent() {
        return BamTrackWithData;
    }

    getMenuComponents() {
        const menu = super.getMenuComponents();
        menu.splice(menu.findIndex(component => component === BackgroundColorConfig), 0, MismatchColorConfig);
        return menu;
    }
}

function MismatchColorConfig(props) {
    return <ColorConfig {...props} optionName="mismatchColor" label="Mismatched base color" />;
}

export default BamTrackRenderer;
