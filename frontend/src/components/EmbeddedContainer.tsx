import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { ActionCreators } from "../AppState";
import App from "../App";

interface EmbeddedProps {
    onSetRestore: any;
    contents: any;
}

class EmbeddedContainer extends React.PureComponent<EmbeddedProps> {

    componentDidUpdate() {
        const { genomeName, viewInterval, trackLegendWidth, isShowingNavigator,  tracks} = this.props.contents;
        const state = {
            viewInterval,
            trackLegendWidth,
            tracks,
            isShowingNavigator,
        };
        this.props.onSetRestore(genomeName, state);
    }

    render(): any {
        return <App />;
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
