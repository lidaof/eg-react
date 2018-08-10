import Rebase from 're-base';
import firebase from 'firebase';

const config = {
    apiKey: "AIzaSyADX844efdjDQG2LrWLhSAB4RiymVnuhOM",
    authDomain: "eg-session.firebaseapp.com",
    databaseURL: "https://eg-session.firebaseio.com",
};
const firebaseApp = firebase.initializeApp(config);

const base = Rebase.createClass(firebaseApp.database());

export { firebaseApp };

export default base;
