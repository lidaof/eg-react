import React from 'react';
import uuid from 'uuid';
import { connect } from "react-redux";
import { compose } from 'redux';
import { firebaseConnect, getVal } from 'react-redux-firebase';
import { AppState } from '../AppState';
import { StateWithHistory } from 'redux-undo';
import { notify } from 'react-notify-toast';
import { AppStateSaver } from '../model/AppSaveLoad';
import { ActionCreators } from "../AppState";

import './SessionUI.css';

interface SessionBundle {
    bundleId: string;
    currentId: string;
    sessionsInBundle: {[id: string]: Session};
}

interface Session { // (serialized)
    label: string;
    date: number;
    state: object;
}

interface CombinedAppState {
    browser: StateWithHistory<AppState>;
    firebase: any;
}

interface HasBundleId {
    bundleId: string;
}

interface SessionUIProps extends CombinedAppState, HasBundleId {
    bundle?: SessionBundle;
    onRestoreSession: any;
    onRetrieveBundle: any;
}

interface SessionUIState {
    newSessionLabel: string;
    retrieveId: string;
}

class SessionUINotConnected extends React.Component<SessionUIProps, SessionUIState> {
    static displayName = "SessionUI";

    constructor(props: SessionUIProps) {
        super(props);
        this.state = {
            newSessionLabel: getFunName(),
            retrieveId: '',
        };
    }

    getBundle(): SessionBundle {
        return this.props.bundle || {
            sessionsInBundle: {},
            bundleId: this.props.bundleId,
            currentId: '',
        };
    }

    saveSession = async () => {
        const {firebase, browser} = this.props;
        const bundle = this.getBundle();
        const sessionId = uuid.v1();
        const newSessionObj = {
            label: this.state.newSessionLabel,
            date: Date.now(),
            state: new AppStateSaver().toObject(browser.present),
        };
        const newBundle = {
            ...bundle,
            sessionsInBundle: {
                ...bundle.sessionsInBundle,
                [sessionId]: newSessionObj
            },
            currentId: sessionId,
        };
        try {
            await firebase.set(`sessions/${bundle.bundleId}`, newBundle);
        } catch (error) {
            console.error(error);
            notify.show('Error while saving session', 'error', 2000);
        }

        notify.show('Session saved!', 'success', 2000);
        this.setRandomLabel();
    }

    setSessionLabel = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({newSessionLabel: event.target.value.trim()});
    }

    setRandomLabel = () => {
        this.setState({newSessionLabel: getFunName()});
    }

    restoreSession = async (sessionId: string) => {
        const {firebase} = this.props;
        const bundle = this.getBundle();
        const newBundle = {
            ...bundle,
            currentId: sessionId
        };
        try {
            await firebase.set(`sessions/${bundle.bundleId}`, newBundle);
        } catch (error) {
            console.error(error);
            notify.show('Error while restoring session', 'error', 2000);
        }
        this.props.onRestoreSession(bundle.sessionsInBundle[sessionId].state);
        notify.show('Session restored.', 'success', 2000);
    }

    deleteSession = async (sessionId: string) => {
        const {firebase, bundleId} = this.props;
        const removePath = `sessions/${bundleId}/sessionsInBundle/${sessionId}`;
        try {
            await firebase.remove(removePath);
        } catch (error) {
            console.error(error);
            notify.show('Error while deleting session', 'error', 2000);
        };
        notify.show('Session deleted.', 'success', 2000);
    }

    renderSavedSessions = () => {
        const bundle: SessionBundle = this.getBundle();
        const buttons = Object.entries(bundle.sessionsInBundle || {}).map( ([id, session]) => {
            let button;
            if (id === bundle.currentId) {
                button = <button className="SessionUI btn btn-secondary btn-sm" disabled={true} >Restored</button>;
            } else {
                // tslint:disable-next-line jsx-no-lambda
                button = <button className="SessionUI btn btn-success btn-sm" onClick={() => this.restoreSession(id)} >
                    Restore
                </button>;
            }

            // tslint:disable-next-line jsx-no-lambda
            const deleteButton = <button onClick={() => this.deleteSession(id)} 
                                    className="SessionUI btn btn-danger btn-sm">Delete</button>

            return (
            <li key={id} >
                <span style={{marginRight: '1ch'}} >{session.label}</span>
                ({new Date(session.date).toLocaleString()})
                {button}
                {deleteButton}
            </li>
            );
        });

        return <ol>{buttons}</ol>;
    }

    setRetrieveId = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({retrieveId: event.target.value.trim()});
    }

    retrieveSession = () => {
        const { retrieveId } = this.state;
        if( retrieveId.length === 0) {
            notify.show('Session bundle Id cannot be empty.', 'error', 2000);
            return
        }
        this.props.onRetrieveBundle(retrieveId);
        const bundle = this.getBundle();
        const currentId = bundle.currentId;
        this.props.onRestoreSession(bundle.sessionsInBundle[currentId].state);
        notify.show('Session retrieved.', 'success', 2000);
    }

    render() {
        return (
        <div>
            <div>
                <label htmlFor="retrieveId">
                    <input type="text" size={40} placeholder="Session bunlde Id" 
                        value={this.state.retrieveId}
                        onChange={this.setRetrieveId}/>
                </label>
                <button className="btn btn-info" onClick={this.retrieveSession}>Retrieve session</button></div>
            <button className="btn btn-primary" onClick={this.saveSession}>Save session</button>
            <div>
                <label htmlFor="sessionLabel">
                    Name your session: <input
                        type="text"
                        value={this.state.newSessionLabel}
                        size={30}
                        onChange={this.setSessionLabel}
                    /> or use a <button
                        type="button"
                        className="SessionUI btn btn-warning btn-sm"
                        onClick={this.setRandomLabel}
                    > Random name</button>
                </label>
            </div>
            {this.renderSavedSessions()}
        </div>
        );
    }
}

const mapDispatchToProps = {
    onRestoreSession: ActionCreators.restoreSession,
    onRetrieveBundle: ActionCreators.retrieveBundle,
};

const enhance = compose(
    firebaseConnect((props: HasBundleId) => {
        return [
            { path: `sessions/${props.bundleId}` },
        ]
    }),
    connect(
        (combinedState: CombinedAppState, props: HasBundleId) => ({
            bundle: getVal(combinedState.firebase, `data/sessions/${props.bundleId}`),
            browser: combinedState.browser
        }),
        mapDispatchToProps
    ),
);

export const SessionUI = enhance(SessionUINotConnected);

function getFunName() {
    const adjectives = [
        'adorable',
        'beautiful',
        'clean',
        'drab',
        'elegant',
        'fancy',
        'glamorous',
        'handsome',
        'long',
        'magnificent',
        'old-fashioned',
        'plain',
        'quaint',
        'sparkling',
        'ugliest',
        'unsightly',
        'angry',
        'bewildered',
        'clumsy',
        'defeated',
        'embarrassed',
        'fierce',
        'grumpy',
        'helpless',
        'itchy',
        'jealous',
        'lazy',
        'mysterious',
        'nervous',
        'obnoxious',
        'panicky',
        'repulsive',
        'scary',
        'thoughtless',
        'uptight',
        'worried'
    ];

    const nouns = [
        'women',
        'men',
        'children',
        'teeth',
        'feet',
        'people',
        'leaves',
        'mice',
        'geese',
        'halves',
        'knives',
        'wives',
        'lives',
        'elves',
        'loaves',
        'potatoes',
        'tomatoes',
        'cacti',
        'foci',
        'fungi',
        'nuclei',
        'syllabuses',
        'analyses',
        'diagnoses',
        'oases',
        'theses',
        'crises',
        'phenomena',
        'criteria',
        'data'
    ];

    return `${getRandomElement(adjectives)}-${getRandomElement(adjectives)}-${getRandomElement(nouns)}`;

    function getRandomElement(array: string[]) {
        return array[Math.floor(Math.random() * array.length)];
    }
}
