import React from 'react';
import shortid from 'shortid';
import { connect } from "react-redux";
import { compose } from 'redux';
import { firebaseConnect, getVal } from 'react-redux-firebase';
import { AppState } from '../AppState';
import { StateWithHistory } from 'redux-undo';
import { notify } from 'react-notify-toast';
import { AppStateSaver } from '../model/AppSaveLoad';
import { ActionCreators } from "../AppState";
import LoadSession from "./LoadSession";
import { CopyToClip } from './CopyToClipboard';
import { readFileAsText } from '../util';

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
    withGenomePicker?: boolean;
}

interface SessionUIState {
    newSessionLabel: string;
    retrieveId: string;
    lastBundleId: string;
}

class SessionUINotConnected extends React.Component<SessionUIProps, SessionUIState> {
    static displayName = "SessionUI";

    constructor(props: SessionUIProps) {
        super(props);
        this.state = {
            newSessionLabel: getFunName(),
            retrieveId: '',
            lastBundleId: '',
        };
    }

    getBundle(): SessionBundle {
        return this.props.bundle || {
            sessionsInBundle: {},
            bundleId: this.props.bundleId,
            currentId: '',
        };
    }

    componentDidMount() {
        this.setState({
            lastBundleId: this.props.bundleId,
        }
        );
    }

    saveSession = async () => {
        const {firebase, browser} = this.props;
        const bundle = this.getBundle();
        const sessionId = shortid.generate();
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
            await firebase.set(`sessions/${bundle.bundleId}`, JSON.parse(JSON.stringify(newBundle)));
        } catch (error) {
            console.error(error);
            notify.show('Error while saving session', 'error', 2000);
        }

        notify.show('Session saved!', 'success', 2000);
        this.setRandomLabel();
    }

    downloadSession = (asHub = false): any => {
        const {browser} = this.props;
        const bundle = this.getBundle();
        const sessionInJSON = new AppStateSaver().toObject(browser.present);
        const content = asHub ? (sessionInJSON as any).tracks : sessionInJSON;
        const descriptor = asHub ? 'hub' : 'session';
        const sessionString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(content));
        const dl = document.createElement("a");
        document.body.appendChild(dl); // This line makes it work in Firefox.
        dl.setAttribute("href", sessionString);
        dl.setAttribute("download", `eg-${descriptor}-${bundle.currentId}-${bundle.bundleId}.json`);
        dl.click();
        notify.show('Session downloaded!', 'success', 2000);
    }

    downloadAsSession = () => {
        this.downloadSession(false);
    }

    downloadAsHub = () => {
        this.downloadSession(true);
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
        this.setState({lastBundleId: bundle.bundleId});
        const newBundle = {
            ...bundle,
            currentId: sessionId
        };
        try {
            await firebase.set(`sessions/${bundle.bundleId}`, newBundle);
        } catch (error) {
            console.error(error);
            if (!this.props.withGenomePicker) {
                notify.show('Error while restoring session', 'error', 2000);
            }
        }
        this.props.onRestoreSession(bundle.sessionsInBundle[sessionId].state);
        if (!this.props.withGenomePicker) {
            notify.show('Session restored.', 'success', 2000);
        }
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
        const { lastBundleId } = this.state;
        const buttons = Object.entries(bundle.sessionsInBundle || {}).map( ([id, session]) => {
            let button;
            if (lastBundleId === bundle.bundleId && id === bundle.currentId) {
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
            return null;
        }
        this.props.onRetrieveBundle(retrieveId);
        notify.show('Session retrieved.', 'success', 2000);
        return <LoadSession bundleId={retrieveId} />;
    }

    uploadSession = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const contents = await readFileAsText(event.target.files[0]);
        this.props.onRestoreSession(JSON.parse(contents as string));
        if (!this.props.withGenomePicker) {
            notify.show('Session uploaded and restored.', 'success', 2000);
        }
    }

    render() {
        return (
        <div>
            <div>
                <label htmlFor="retrieveId">
                    <input type="text" size={40} placeholder="Session bundle Id" 
                        value={this.state.retrieveId}
                        onChange={this.setRetrieveId}/>
                </label>
                <button className="SessionUI btn btn-info" onClick={this.retrieveSession}>Retrieve</button>
                <div className="SessionUI-upload-btn-wrapper">
                    Or use a session file: <button className="SessionUI btn btn-success">Upload</button>
                    <input type="file" name="sessionfile" onChange={this.uploadSession} />
                </div>
            </div>
            {!this.props.withGenomePicker && 
                <React.Fragment>
                    <div>
                        <p>Session bundle Id: {this.props.bundleId} <CopyToClip value={this.props.bundleId} /></p>
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
                    <button className="SessionUI btn btn-primary" onClick={this.saveSession}>Save session</button>
                    {' '}
                    <button className="SessionUI btn btn-success" onClick={this.downloadAsSession}>
                        Download current session</button>
                    {' '}
                    <button className="SessionUI btn btn-info" onClick={this.downloadAsHub}>
                        Download as datahub</button>
                </React.Fragment>
            }
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

export const SessionUI = enhance(SessionUINotConnected as any);

function getFunName() {
    const adjectives = [
        "Crazy",
        "Excited",
        "Amazing",
        "Adventurous",
        "Acrobatic",
        "Adorable",
        "Arctic",
        "Astonished",
        "Awkward",
        "Awesome",
        "Beautiful",
        "Boring",
        "Bossy",
        "Bright",
        "Clever",
        "Confused",
        "Crafty",
        "Enchanted",
        "Evil",
        "Exhausted",
        "Small",
        "Large",
        "Fabulous",
        "Funny",
        "Glamorous",
        "Glistening",
        "Glittering",
        "Great",
        "Handsome",
        "Happy",
        "Honest",
        "Humongous",
        "Hungry",
        "Incredible",
        "Intelligent",
        "Jumbo",
        "Lazy",
        "Lonely",
        "Lucky",
        "Magnificent",
        "Majestic",
        "Marvelous",
        "Memorable",
        "Mysterious",
        "Nervous",
        "Outstanding",
        "Peaceful",
        "Perfect",
        "Pesky",
        "Playful",
        "Powerful",
        "Quarrelsome",
        "Radiant",
        "Scholarly",
        "Scientific",
        "Silly",
        "Smart",
        "Splendid",
        "Spotted",
        "Strange",
        "Terrific",
        "Unlucky",
        "Vibrant",
        "Whimsical"
    ];

    const colors = [
        "red",
        "orange",
        "yellow",
        "green",
        "blue",
        "indigo",
        "violet",
        "brown",
        "gray",
        "black",
        "white",
        "turquiose",
        "amber",
        "apricot",
        "aquamarine",
        "beige",
        "bronze",
        "silver",
        "gold",
        "carmine",
        "charcoal",
        "chartreuse",
        "copper",
        "cyan",
        "eggplant",
        "emerald",
        "pink",
        "lavendar",
        "lilac",
        "lime",
        "lemon",
        "peach",
        "periwinkle",
        "rose",
        "rainbow",
        "magenta",
        "salmon",
        "sapphire",
        "scarlet",
        "slate",
        "tangerine",
        "teal",
        "topaz"
    ];

    const nouns = [
        "elephant",
        "buffalo",
        "squirrel",
        "otter",
        "dragon",
        "unicorn",
        "hippo",
        "hippogriff",
        "phoenix",
        "centaur",
        "octopus",
        "squid",
        "platypus",
        "niffler",
        "troll",
        "griffin",
        "slug",
        "eagle",
        "owl",
        "horse",
        "rhino",
        "lion",
        "lynx",
        "porcupine",
        "snake",
        "bull",
        "dog",
        "wolf",
        "lizard",
        "wallaby",
        "opossum",
        "alligator",
        "badger",
        "beaver",
        "bison",
        "goose",
        "turtle",
        "turtoise",
        "turkey",
        "pelican",
        "walrus",
        "anteater",
        "bandicoot",
        "fox",
        "whale",
        "dolphin",
        "bat",
        "dog",
        "cat",
        "bear",
        "moose",
        "swan",
        "spider",
        "monkey",
        "lemur",
        "marmoset",
        "kangaroo",
        "deer",
        "flamingo",
        "ferret",
        "stork",
        "deer",
        "macaw",
        "duck",
        "shark",
        "chinchilla",
        "python",
        "aardvark",
        "toad",
        "frog",
        "lizard",
        "ant",
        "bear",
        "buffalo",
        "caterpillar",
        "dingo",
        "mouse",
        "rat",
        "donkey",
        "dragonfly",
        "duck",
        "crocodile",
        "penguin",
        "leopard",
        "tiger",
        "jaguar",
        "coyote",
        "crab",
        "eel",
        "tamarin",
        "seal",
        "gharial",
        "clam",
        "panda",
        "beetle",
        "goat",
        "hyena",
        "jellyfish",
        "iguana",
        "liger",
        "tigon",
        "llama",
        "lobster",
        "lynx",
        "manatee",
        "newt",
        "ostrich",
        "oyster",
        "puma",
        "rabbit",
        "scorpion",
        "sloth",
        "stingray",
        "zonkey"
    ];

    return `${getRandomElement(adjectives)}-${getRandomElement(colors)}-${getRandomElement(nouns)}`;

    function getRandomElement(array: string[]) {
        return array[Math.floor(Math.random() * array.length)];
    }
}
