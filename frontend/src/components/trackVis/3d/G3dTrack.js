import React from 'react';
import PropTypes from 'prop-types';
import Track from '../commonComponents/Track';
import TrackLegend from '../commonComponents/TrackLegend';
import { NglRender } from './NglRender';

export const DEFAULT_OPTIONS = {    
    height: 500,
    backgroundColor: 'white',
};

/**
 * Track displaying 3d structure.
 * 
 * @author Daofeng Li
 */
class G3dTrack extends React.PureComponent {
    static propTypes = Object.assign({}, Track.propsFromTrackContainer,
        {
        data: PropTypes.array.isRequired, // PropTypes.arrayOf(CallingCard)
        options: PropTypes.shape({
            height: PropTypes.number.isRequired, // Height of the track
        }).isRequired,
        isLoading: PropTypes.bool, // If true, applies loading styling
        error: PropTypes.any, // If present, applies error styling
    });


    render() {
        const {data, trackModel, width, options, } = this.props;
        return <Track
            {...this.props}
            legend={<TrackLegend 
                trackModel={trackModel} height={options.height}
                />}
        // legend={<TrackLegend trackModel={trackModel} height={50} />}
            visualizer={<NglRender data={data[0]} width={width} height={options.height} /> }
        />;
    }
}

export default G3dTrack;
