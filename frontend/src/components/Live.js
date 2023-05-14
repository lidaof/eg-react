import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { firebaseConnect, isLoaded, isEmpty } from "react-redux-firebase";
import { ActionCreators } from "../AppState";
import { Link } from "react-router-dom";
import { notify } from 'react-notify-toast';
import App from "../App";
import { AppStateSaver } from '../model/AppSaveLoad';

class Live extends React.Component {

    componentDidUpdate(prevProps){
        const { liveId } = this.props.match.params;
        const { live, onSetRestore } = this.props;
        const genome = live[liveId].present.genomeName;
        if (prevProps.live !== live) {
            onSetRestore(genome, live[liveId].present);
        }
    }

    async UNSAFE_componentWillReceiveProps(nextProps) {
        const { firebase, browser } = this.props;
        const { liveId } = this.props.match.params;
        if (nextProps.browser.present !== browser.present) {
            const nextObj = new AppStateSaver().toObject(nextProps.browser.present);
            const cleanedObj = JSON.parse(JSON.stringify(nextObj));
            try {
                await firebase.update(`live/${liveId}/`, {
                        present: cleanedObj,
                    }
                );
            } catch (error) {
                console.error(error);
                notify.show("Error sync to live", "error", 2000);
            }
        }
    }

    render() {
        const { liveId } = this.props.match.params;
        const { live } = this.props;
        const theme = this.props.darkTheme ? "dark" : "light";
        if (!isLoaded(live)) {
            return <div>Loading...</div>;
        }
        if ( isEmpty(live) || isEmpty(live[liveId])) {
            return <div>Live browser content is empty
                <br/>
            <Link to="/">Go home</Link>
            </div>;
        }
        return <App />;
    }
}

const mapStateToProps = (state, props) => {
    return {
        live: state.firebase.data.live,
        browser: state.browser,
        darkTheme: state.browser.present.darkTheme,
    };
};

const mapDispatchToProps = {
    onSetRestore: ActionCreators.setGenomeRestoreSession,
};

export default compose(
    firebaseConnect((props) => [{ path: `live/${props.match.params.liveId}` }]),
    connect(mapStateToProps, mapDispatchToProps)
)(Live);
