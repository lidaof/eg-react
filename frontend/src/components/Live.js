import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { firebaseConnect, isLoaded, isEmpty } from 'react-redux-firebase';
import { ActionCreators } from "../AppState";
import { AppStateSaver } from '../model/AppSaveLoad';
import { Link } from "react-router-dom";
import _ from 'lodash';

class Live extends React.Component {

    componentDidUpdate = async (prevProps) => {
        const { liveId, live, onSetRestore } = this.props;
        const genome = live[liveId].state.genomeName;
        onSetRestore(genome, live[liveId].state);
        // if( !(_.isEqual(prevProps.live, live)) ) {
        //     console.log('aaa');
        //     try {
        //         await firebase.update(`live/${liveId}`, {
        //                 state: live[liveId].state
        //             }
        //         );
        //     } catch (error) {
        //         console.error(error);
        //     }
        // }
    }


    render() {
        console.log(this.props);
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
