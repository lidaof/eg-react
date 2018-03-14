import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import HG19 from './model/genomes/hg19/hg19';
import DisplayedRegionModel from './model/DisplayedRegionModel';
import BrowserScene from './components/vr/BrowserScene';
import Custom3DObject from './components/vr/Custom3DObject';
import mergeGeometries from './components/vr/mergeGeometries';

const root = document.getElementById('root');
if (root) {
    ReactDOM.render(<App />, root);
    registerServiceWorker();
} else {
    window.React = React;
    window.ReactDOM = ReactDOM;
    window.hg19Context = HG19.makeNavContext();
    window.DisplayedRegionModel = DisplayedRegionModel;
    window.BrowserScene = BrowserScene;
    window.Custom3DObject = Custom3DObject;
    window.mergeGeometries = mergeGeometries;
}
