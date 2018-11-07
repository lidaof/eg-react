import React from 'react';
import { connect } from 'react-redux';
import { ActionCreators } from '../AppState';
import App from '../App';

interface EmbeddedProps {
    onSetRestore: any;
    contents: any;
}

class EmbeddedContainer extends React.PureComponent<EmbeddedProps> {

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

    render(): JSX.Element {
        // somehow react complain `Property 'embeddingMode' does not exist on type 'IntrinsicAttributes'
        // if I give the prop directly
        const otherProps = {embeddingMode: true};
        return <App {...otherProps}/>;
    }   
};

const mapStateToProps = (state: any) => {
    return {
        browser: state.browser,
    };
}

const mapDispatchToProps = {
    onSetRestore: ActionCreators.setGenomeRestoreSession,
};

export default connect(mapStateToProps, mapDispatchToProps)(EmbeddedContainer);
