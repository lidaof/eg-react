import React from 'react';
import { ActionCreators as UndoActionCreators } from 'redux-undo';
import { connect } from 'react-redux';

import './UndoRedo.css';

let UndoRedo = ({ canUndo, canRedo, onUndo, onRedo }) => (
    <React.Fragment>
        <button onClick={onUndo} disabled={!canUndo} title="Undo" className="btn btn-light">
        ⟲
        </button>
        <button onClick={onRedo} disabled={!canRedo} title="Redo" className="btn btn-light">
        ⟳
        </button>
    </React.Fragment>
);

const mapStateToProps = (state) => {
  return {
    canUndo: state.browser.past.length > 0,
    canRedo: state.browser.future.length > 0
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    onUndo: () => dispatch(UndoActionCreators.undo()),
    onRedo: () => dispatch(UndoActionCreators.redo())
  }
};

UndoRedo = connect(
  mapStateToProps,
  mapDispatchToProps
)(UndoRedo);

export default UndoRedo;
