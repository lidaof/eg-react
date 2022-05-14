import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { firebaseConnect, isLoaded, isEmpty } from 'react-redux-firebase';
import { GlobalActionCreators } from "../AppState";
import { Link } from "react-router-dom";

class LoadSession extends React.PureComponent {

    componentDidUpdate = () => {
        const { bundleId, bundle, onSetRestore } = this.props;
        const currentId = bundle[bundleId].currentId;
        const genome = bundle[bundleId].sessionsInBundle[currentId].state.genomeName;
        onSetRestore(genome, bundle[bundleId].sessionsInBundle[currentId].state);
    }

    render() {
        const { bundle } = this.props;
        if (!isLoaded(bundle)) {
            return <div>Loading...</div>;
        }
        if (isEmpty(bundle)) {
            return <div>Session bundle is empty
                <br/>
            <Link to="/">Go home</Link>
            </div>;
        }
        return null;
    }   
};

const mapDispatchToProps = {
    onSetRestore: GlobalActionCreators.setGenomeRestoreSession,
};

export default compose(
    firebaseConnect(props => [
        { path: `sessions/${props.bundleId}` }
    ]),
    connect(state => ({
        bundle: state.firebase.data.sessions,
        browser: state.browser,
    }),
    mapDispatchToProps
    )
)(LoadSession);
