import React from 'react';
import { connect } from "react-redux";
import { compose } from 'redux';
import { firebaseConnect, getVal } from 'react-redux-firebase';
import { notify } from 'react-notify-toast';
import { Redirect } from 'react-router'

class LiveUI extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            isLive: false,
        };
    }

    goLive = async () => {
        const { liveId, firebase, browser} = this.props;
        try {
            await firebase.set(`live/${liveId}`, {liveId, state: browser.present});
        } catch (error) {
            console.error(error);
            notify.show('Error while go live', 'error', 2000);
        }
        notify.show('Live mode!', 'success', 2000);
        this.setState({isLive: true});

    }

    render() {
        const { liveId } = this.props;
        if (this.state.isLive) {
            return <Redirect to={{
                pathname: '/',
                search: `?live=${liveId}`,
              }}/>;
            
        }
        return(
            <div>
                <button className="btn btn-primary" onClick={this.goLive}>Go Live</button>
                <p>
                    How this works: Click the button above will navigate you to a new link, which you can share
                    with your PI, collaborators or friends. What you see on the screen will be seen
                    by them too, at real time.
                </p>
            </div>
        );
    }
}

const enhance = compose(
    firebaseConnect((props) => {
        return [
            { path: `live/${props.liveId}` },
        ]
    }),
    connect(
        (state, props) => ({
            live: getVal(state.firebase, `data/live/${props.liveId}`),
            browser: state.browser
        }),
    ),
);

export default enhance(LiveUI);