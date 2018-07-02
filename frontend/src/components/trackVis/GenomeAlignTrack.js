import React from 'react';
import PropTypes from 'prop-types';

import Track from './commonComponents/Track';
import AnnotationTrack from './commonComponents/annotation/AnnotationTrack';
import TrackLegend from './commonComponents/TrackLegend';
import Tooltip from './commonComponents/tooltip/Tooltip';
import withTooltip from './commonComponents/tooltip/withTooltip';
import configOptionMerging from './commonComponents/configOptionMerging';

import { GenomeAlignDisplayModes } from '../../model/DisplayModes';

import './commonComponents/tooltip/Tooltip.css';

const TOP_PADDING = 3;
export const DEFAULT_OPTIONS = {
    height: 40,
    displayMode: GenomeAlignDisplayModes.ROUGH,
};
const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);

/**
 * RepeatMasker track.
 * Although rmsk uses bigbed as data source, but rmsk has much more contents to be draw so was separated from basic
 * bigbed.
 * 
 * @author Daofeng Li
 * @author Silas Hsu
 */
class GenomeAlignTrack extends React.PureComponent {
    static propTypes = Object.assign({},
        Track.propsFromTrackContainer,
        withTooltip.INJECTED_PROPS,
        {
        data: PropTypes.array.isRequired, 
        }
    );

    constructor(props) {
        super(props);
        
    }

    /** 
     * @inheritdoc
     */
    render() {
        const {viewRegion, width, trackModel, options, data} = this.props;
        console.log(data);
        return 'aaa';
    }
}

export default withDefaultOptions(withTooltip(GenomeAlignTrack));
