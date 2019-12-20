import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import AppRouter from './AppRouter';
import AppState from './AppState';
import * as serviceWorker from './serviceWorker';

import HG19 from './model/genomes/hg19/hg19';
import DisplayedRegionModel from './model/DisplayedRegionModel';
import { BrowserScene } from './components/vr/BrowserScene';
import { Custom3DObject } from './components/vr/Custom3DObject';
import { mergeGeometries } from './components/vr/mergeGeometries';

import EmbeddedContainer from './components/EmbeddedContainer';

import './index.css';

const root = document.getElementById('root');
if (root) {
    ReactDOM.render(<Provider store={AppState} ><AppRouter /></Provider>, root);
    serviceWorker.register({ onUpdate: () => ReactDOM.render(<ReloadNotification />, document.getElementById('newVersionNotification')) });
} else {
    (window as any).React = React;
    (window as any).ReactDOM = ReactDOM;
    (window as any).hg19Context = HG19.navContext;
    (window as any).DisplayedRegionModel = DisplayedRegionModel;
    (window as any).BrowserScene = BrowserScene;
    (window as any).Custom3DObject = Custom3DObject;
    (window as any).mergeGeometries = mergeGeometries;
}

(window as any).renderBrowserInElement = (contents: any, container: any) =>
    ReactDOM.render(<Provider store={AppState} ><EmbeddedContainer contents={contents} /></Provider>,
        container);


function ReloadNotification(props: {}): JSX.Element {
    return <div>
        A new version of the browser is available. Please reload the page.
    </div>;
}