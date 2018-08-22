import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { firebaseConnect, isLoaded, isEmpty } from 'react-redux-firebase';
import { ActionCreators } from "../AppState";
import { Link } from "react-router-dom";

class Live extends React.PureComponent {

    componentDidUpdate = () => {
        const { liveId, live, onSetRestore } = this.props;
        const genome = live.state.genomeName;
        onSetRestore(genome, live.state);
    }

    render() {
        const { live } = this.props;
        if (!isLoaded(live)) {
            return <div>Loading...</div>;
        }
        if (isEmpty(live)) {
            return <div>Live browser content is empty
                <br/>
            <Link to="/">Go home</Link>
            </div>;
        }
        return null;
    }   
};

const mapDispatchToProps = {
    onSetRestore: ActionCreators.setGenomeRestoreSession,
};

export default compose(
    firebaseConnect(props => [
        { path: `live/${props.liveId}` }
    ]),
    connect(state => ({
        live: state.firebase.data.live,
        browser: state.browser,
    }),
    mapDispatchToProps
    )
)(Live);
