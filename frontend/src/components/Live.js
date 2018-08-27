import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { firebaseConnect, isLoaded, isEmpty, getVal } from 'react-redux-firebase';
import { ActionCreators } from "../AppState";
import { Link } from "react-router-dom";
import { App } from "../App";
import { getGenomeConfig } from '../model/genomes/allGenomes';
import { AppStateLoader } from '../model/AppSaveLoad';

class Live extends React.Component {
    render() {
        const { live, liveId } = this.props;
        if (!isLoaded(live)) {
            return <div>Loading...</div>;
        }
        if ( isEmpty(live) || isEmpty(live[liveId])) {
            return <div>Live browser content is empty
                <br/>
            <Link to="/">Go home</Link>
            </div>;
        }
        console.log(this.props);
        const { onNewViewRegion, onTracksChanged, browser, viewRegion, tracks } = this.props;
        const liveState = live[liveId].present;
        const genomeConfig = getGenomeConfig(liveState.genomeName);
        return <App 
                    genomeConfig={genomeConfig} 
                    viewRegion={viewRegion}
                    tracks={tracks}
                    onNewViewRegion={onNewViewRegion}
                    onTracksChanged={onTracksChanged}
                />;
        return <div>Test!</div>;
    }
};

const mapStateToProps = (state, props) => {
    const fireObj = getVal(state.firebase, `data/live/${props.liveId}/present`);
    const present = fireObj ? new AppStateLoader().fromObject(fireObj): undefined;
    return {
        live: state.firebase.data.live,
        browser: {present},
        // browser: state.browser,
        viewRegion: present ? present.viewRegion: undefined,
        tracks: present ? present.tracks: undefined,
        bundleId: present ? present.bundleId: undefined,
        liveId: present ? present.liveId: undefined,
        sessionFromUrl: present ? present.sessionFromUrl: undefined,
        liveFromUrl: present ? present.liveFromUrl: undefined,
    };
}

const mapDispatchToProps = {
    onNewViewRegion: ActionCreators.setViewRegion,
    onTracksChanged: ActionCreators.setTracks,
};

export default compose(
    firebaseConnect(props => [
        { path: `live/${props.liveId}` }
    ]),
    connect(mapStateToProps, mapDispatchToProps),
)(Live);
