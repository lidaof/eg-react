import React from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from '../ErrorBoundary';
import TrackModel from '../../model/TrackModel';

import '../track/Track.css';

/**
 * A component that catches errors, and still behaves somewhat like a Track in TrackContainers.
 * 
 * @author Silas Hsu
 */
class TrackErrorBoundary extends React.Component {
    /**
     * @see Track.propTypes
     */
    static propTypes = {
        trackModel: PropTypes.instanceOf(TrackModel),
        index: PropTypes.number,
        onContextMenu: PropTypes.func,
        onClick: PropTypes.func,
    };

    static defaultProps = {
        trackModel: {},
        onContextMenu: (event, index) => undefined,
        onClick: (event, index) => undefined,
    };

    constructor(props) {
        super(props);
        this.renderErrorMessage = this.renderErrorMessage.bind(this);
    }

    renderErrorMessage(error) {
        const {trackModel, index, onContextMenu, onClick} = this.props;
        return (
        <div
            className={trackModel.isSelected ? "Track-selected-border" : undefined}
            style={{backgroundColor: "pink", textAlign: "center"}}
            onContextMenu={event => onContextMenu(event, index)}
            onClick={event => onClick(event, index)}
        >
            {/* eslint-disable-line jsx-a11y/accessible-emoji */}
            😵 Track crashed 😵
        </div>
        );
    }

    render() {
        return <ErrorBoundary getErrorElement={this.renderErrorMessage} {...this.props} />;
    }
}

export default TrackErrorBoundary;
