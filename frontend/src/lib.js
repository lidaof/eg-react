import React from 'react';
import { connect } from 'react-redux';
import { GlobalActionCreators } from './AppState';
import App from './App';


class EmbeddedContainer extends React.PureComponent {

    componentDidMount() {
        const { genomeName, displayRegion, trackLegendWidth, isShowingNavigator, tracks, 
            metadataTerms, regionSets, regionSetViewIndex } = this.props.contents;        
        const state = {
            genomeName,
            displayRegion,
            trackLegendWidth,
            tracks,
            isShowingNavigator,
            metadataTerms,
            regionSets,
            regionSetViewIndex,
        };
        this.props.onSetRestore(genomeName, state);
    }

    render() {
        // somehow react complain `Property 'embeddingMode' does not exist on type 'IntrinsicAttributes'
        // if I give the prop directly
        const otherProps = {embeddingMode: true};
        return <App {...otherProps}/>;
    }   
};

const mapStateToProps = (state) => {
    return {
        browser: state.browser,
    };
}

const mapDispatchToProps = {
    onSetRestore: GlobalActionCreators.setGenomeRestoreSession,
};

export default connect(mapStateToProps, mapDispatchToProps)(EmbeddedContainer);
