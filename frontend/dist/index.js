"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var React = _interopRequireWildcard(require("react"));

var ReactDOM = _interopRequireWildcard(require("react-dom"));

var _reactRedux = require("react-redux");

var _AppRouter = _interopRequireDefault(require("./AppRouter"));

var _AppState = _interopRequireDefault(require("./AppState"));

var serviceWorker = _interopRequireWildcard(require("./serviceWorker"));

var _hg = _interopRequireDefault(require("./model/genomes/hg19/hg19"));

var _DisplayedRegionModel = _interopRequireDefault(require("./model/DisplayedRegionModel"));

var _BrowserScene = require("./components/vr/BrowserScene");

var _Custom3DObject = require("./components/vr/Custom3DObject");

var _mergeGeometries = require("./components/vr/mergeGeometries");

var _EmbeddedContainer = _interopRequireDefault(require("./components/EmbeddedContainer"));

require("./index.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var root = document.getElementById("root");

if (root) {
  ReactDOM.render( /*#__PURE__*/React.createElement(_reactRedux.Provider, {
    store: _AppState.default
  }, /*#__PURE__*/React.createElement(_AppRouter.default, null)), root);
  serviceWorker.register({
    onUpdate: function onUpdate() {
      return ReactDOM.render( /*#__PURE__*/React.createElement(ReloadNotification, null), document.getElementById("newVersionNotification"));
    }
  });
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
  return ReactDOM.render( /*#__PURE__*/React.createElement(_reactRedux.Provider, {
    store: _AppState.default
  }, /*#__PURE__*/React.createElement(_EmbeddedContainer.default, {
    contents: contents
  })), container);
};

function ReloadNotification() {
  return /*#__PURE__*/React.createElement("div", {
    className: "alert alert-info lead",
    role: "alert"
  }, "A new version of the browser is available. Please reload the page.");
}