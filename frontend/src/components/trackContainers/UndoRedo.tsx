import React from 'react';
import { ActionCreators as UndoActionCreators } from 'redux-undo';
import { connect } from 'react-redux';

import './UndoRedo.css';

/**
 * a component to undo, redo one user's operation on trackContainer
 * @author Daofeng Li
 */

let UndoRedo = ({ canUndo, canRedo, onUndo, onRedo }:any) => (
    <React.Fragment>
        <button onClick={onUndo} disabled={!canUndo} title="Undo" className="btn btn-light">
        ⟲
        </button>
        <button onClick={onRedo} disabled={!canRedo} title="Redo" className="btn btn-light">
        ⟳
        </button>
    </React.Fragment>
);

const mapStateToProps = (state:any) => {
  return {
    canUndo: state.browser.past.length > 0,
    canRedo: state.browser.future.length > 0
  }
};

const mapDispatchToProps = (dispatch:any) => {
  return {
    onUndo: () => dispatch(UndoActionCreators.undo()),
    onRedo: () => dispatch(UndoActionCreators.redo())
  }
};

// @ts-ignore
UndoRedo = connect(
  mapStateToProps,
  mapDispatchToProps
)(UndoRedo);

export default UndoRedo;
