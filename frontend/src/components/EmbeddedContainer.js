import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { ActionCreators } from "../AppState";

class EmbeddedContainer extends React.PureComponent {

    componentDidUpdate = () => {
        const { genomeName, viewInterval, trackLegendWidth, isShowingNavigator,  tracks} = this.props.contents;
        const state = {
            viewInterval,
            trackLegendWidth,
            tracks,
            isShowingNavigator,
        };
        this.props.onSetRestore(genomeName, state);
    }

    render() {
        return null;
    }   
};

const mapDispatchToProps = {
    onSetRestore: ActionCreators.setGenomeRestoreSession,
};

export default compose(
    connect(null,
    mapDispatchToProps
    )
)(EmbeddedContainer);
