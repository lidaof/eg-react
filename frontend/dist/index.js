"use strict";

var React = _interopRequireWildcard(require("react"));

var ReactDOM = _interopRequireWildcard(require("react-dom"));

var _reactRedux = require("react-redux");

var _AppRouter = _interopRequireDefault(require("./AppRouter"));

var _AppState = _interopRequireDefault(require("./AppState"));

var _registerServiceWorker = _interopRequireDefault(require("./registerServiceWorker"));

var _hg = _interopRequireDefault(require("./model/genomes/hg19/hg19"));

var _DisplayedRegionModel = _interopRequireDefault(require("./model/DisplayedRegionModel"));

var _BrowserScene = require("./components/vr/BrowserScene");

var _Custom3DObject = require("./components/vr/Custom3DObject");

var _mergeGeometries = require("./components/vr/mergeGeometries");

var _EmbeddedContainer = _interopRequireDefault(require("./components/EmbeddedContainer"));

require("./index.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var root = document.getElementById('root');

if (root) {
  ReactDOM.render(React.createElement(_reactRedux.Provider, {
    store: _AppState.default
  }, React.createElement(_AppRouter.default, null)), root);
  (0, _registerServiceWorker.default)();
} else {
  window.React = React;
  window.ReactDOM = ReactDOM;
  window.hg19Context = _hg.default.navContext;
  window.DisplayedRegionModel = _DisplayedRegionModel.default;
  window.BrowserScene = _BrowserScene.BrowserScene;
  window.Custom3DObject = _Custom3DObject.Custom3DObject;
  window.mergeGeometries = _mergeGeometries.mergeGeometries;
}

window.renderBrowserInElement = function (contents, container) {
  return ReactDOM.render(React.createElement(_reactRedux.Provider, {
    store: _AppState.default
  }, React.createElement(_EmbeddedContainer.default, {
    contents: contents
  })), container);
};