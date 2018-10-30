import React from 'react';
import { connect } from "react-redux";
import { compose } from 'redux';
import { firebaseConnect, getVal } from 'react-redux-firebase';
import { notify } from 'react-notify-toast';
import { Redirect } from 'react-router'
import shortid from "shortid";
import { AppStateSaver } from '../model/AppSaveLoad';

const liveId = shortid.generate();

class LiveUI extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            isLive: false,
            shouldGoHome: false,
        };
    }

    goLive = async () => {
        const { firebase, browser} = this.props;
        const currentObj = new AppStateSaver().toObject(browser.present);
        try {
            await firebase.set(`live/${liveId}/`, {
                    liveId, 
                    present: {...currentObj, liveId},
                }
            );
        } catch (error) {
            console.error(error);
            notify.show('Error while go live', 'error', 2000);
        }
        notify.show('Live mode!', 'success', 2000);
        this.setState({isLive: true});

    }

    endLive = () => {
        this.setState({shouldGoHome: true});
    }

    render() {
        if (this.state.isLive) {
            return (
                <React.Fragment>
                    <p></p>
                    <p>You are now in Live mode, <br/>you can share the current URL with others.</p>
                    <Redirect to={{
                        pathname: `/live/${liveId}`,
                    }}/>
                </React.Fragment>
            
            );
            
        } else {
            return(
                <div>
                    <button className="btn btn-primary" onClick={this.goLive}>Go Live</button>
                    <p>
                        How this works: Click the button above will navigate you to a new link, <br/>
                        which you can share with your PI, collaborators or friends. <br/>
                        What you see on the screen will be seen by them too, at real time.
                    </p>
                    <button className="btn btn-warning" onClick={this.endLive}>End Live</button>
                    { this.state.shouldGoHome &&
                        <Redirect to={{
                            pathname: `/`,
                        }}/>
                    }
                </div>
            );
        }
    }
}

const enhance = compose(
    firebaseConnect(() => {
        return [
            { path: `live/${liveId}` },
        ]
    }),
    connect(
        (state) => ({
            live: getVal(state.firebase, `data/live/${liveId}`),
            browser: state.browser
        }),
    ),
);

export default enhance(LiveUI);