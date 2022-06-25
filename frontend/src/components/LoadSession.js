import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { firebaseConnect, isLoaded, isEmpty } from "react-redux-firebase";
// import { Link } from "react-router-dom";
import { ActionCreators } from "../AppState";

class LoadSession extends React.PureComponent {
    componentDidUpdate = () => {
        const { bundleId, bundle, onSetRestore } = this.props;
        if (bundle && bundle[bundleId]) {
            const currentId = bundle[bundleId].currentId;
            const genome = bundle[bundleId].sessionsInBundle[currentId].state.genomeName;
            onSetRestore(genome, bundle[bundleId].sessionsInBundle[currentId].state);
        }
    };

    render() {
        const { bundle } = this.props;
        if (!isLoaded(bundle)) {
            return <div>Loading...</div>;
        }
        if (isEmpty(bundle) || !Object.values(bundle).filter((x) => x).length) {
            return (
                <div className="bg">
                    <p className="lead">Session bundle is empty</p>
                    <p>
                        please make sure you clicked the 'Save Session' button in Session menu. If you think this is an
                        error, please contact browser admin.
                    </p>
                    {/* <br />
                    <Link to="/">
                        Go home
                    </Link> */}
                </div>
            );
        }
        return null;
    }
}

const mapDispatchToProps = {
    onSetRestore: ActionCreators.setGenomeRestoreSession,
};

export default compose(
    firebaseConnect((props) => [{ path: `sessions/${props.bundleId}` }]),
    connect(
        (state) => ({
            bundle: state.firebase.data.sessions,
            browser: state.browser,
        }),
        mapDispatchToProps
    )
)(LoadSession);
