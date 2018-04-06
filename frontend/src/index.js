import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import App from './App';
import AppState from './AppState';
import registerServiceWorker from './registerServiceWorker';

import HG19 from './model/genomes/hg19/hg19';
import DisplayedRegionModel from './model/DisplayedRegionModel';
import BrowserScene from './components/vr/BrowserScene';
import Custom3DObject from './components/vr/Custom3DObject';
import mergeGeometries from './components/vr/mergeGeometries';

import './index.css';

const root = document.getElementById('root');
if (root) {
    ReactDOM.render(<Provider store={AppState} ><App /></Provider>, root);
    registerServiceWorker();
} else {
    window.React = React;
    window.ReactDOM = ReactDOM;
    window.hg19Context = HG19.navContext;
    window.DisplayedRegionModel = DisplayedRegionModel;
    window.BrowserScene = BrowserScene;
    window.Custom3DObject = Custom3DObject;
    window.mergeGeometries = mergeGeometries;
}
