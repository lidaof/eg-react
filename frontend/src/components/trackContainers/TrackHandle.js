import React from 'react';
import Reparentable from '../Reparentable';
import TrackErrorBoundary from './TrackErrorBoundary';
import getTrackRenderer from '../trackConfig/getTrackRenderer';

/**
 * Renders a track subtype wrapped in necessary components, such as an error boundary.  All props passed to this
 * component are passed to the track subtype.
 * 
 * @author Silas Hsu
 */
class TrackHandle extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getTrackSpecialization(props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.trackModel !== nextProps.trackModel) {
            this.setState(this.getTrackSpecialization(nextProps));
        }
    }

    getTrackSpecialization(props) {
        const renderer = getTrackRenderer(props.trackModel);
        return {
            component: renderer.getComponent(),
            options: renderer.getOptions()
        };
    }

    render() {
        const {trackModel, index, onContextMenu, onClick} = this.props;
        const TrackSubtype = this.state.component;
        return (
        <TrackErrorBoundary
            trackModel={trackModel}
            index={index}
            onContextMenu={onContextMenu}
            onClick={onClick}
        >
            <TrackSubtype {...this.props} options={this.state.options} />
        </TrackErrorBoundary>
        );
    }
}

/**
 * Everything a TrackHandle is, except reparentable!
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} - track element
 * @see TrackHandle
 */
function ReparentableHandle(props) {
    return <Reparentable uid={"track-" + props.trackModel.getId()} ><TrackHandle {...props} /></Reparentable>
}

export default ReparentableHandle;
