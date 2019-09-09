import React from 'react';
import PropTypes from 'prop-types';

import Track from '../commonComponents/Track';



/**
 * Track displaying 3d structure.
 * 
 * @author Daofeng Li
 */
class G3dTrack extends React.PureComponent {
    static propTypes = Object.assign({}, Track.propsFromTrackContainer,
        {
        data: PropTypes.array.isRequired, // PropTypes.arrayOf(CallingCard)
        // options: PropTypes.shape({
        //     height: PropTypes.number.isRequired, // Height of the track
        //     color: PropTypes.string, // Color to draw circle
        // }).isRequired,
        isLoading: PropTypes.bool, // If true, applies loading styling
        error: PropTypes.any, // If present, applies error styling
    });


    

    render() {
        console.log(this.props);
        return <Track
            {...this.props}
            
        />;
    }
}

export default G3dTrack;
