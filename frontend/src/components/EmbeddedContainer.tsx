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
        const { genomeName, viewInterval, trackLegendWidth, isShowingNavigator, tracks, 
            metadataTerms, regionSets, regionSetViewIndex} = this.props.contents;
        const state = {
            viewInterval,
            trackLegendWidth,
            tracks,
            isShowingNavigator,
            metadataTerms,
            regionSets,
            regionSetViewIndex,
        };
        this.props.onSetRestore(genomeName, state);
    }

    render(): any {
        const otherProps = {embeddingMode: true};
        return <App {...otherProps}/>;
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
