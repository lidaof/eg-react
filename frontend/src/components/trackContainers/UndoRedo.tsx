import React from 'react';
import { ActionCreators as UndoActionCreators } from 'redux-undo';
import { connect } from 'react-redux';
import {
  Undo as UndoIcon,
  Redo as RedoIcon
} from '@material-ui/icons';
import { IconButton } from '@material-ui/core';

import './UndoRedo.css';

const buttonStyle: React.CSSProperties = { outline: 'none' }

/**
 * a component to undo, redo one user's operation on trackContainer
 * @author Daofeng Li
 */
// TODO: fix the duplicate undo redo that occurs with more than one genome (have to undo twice for one action when there are two genomes)
let UndoRedo = ({ canUndo, canRedo, onUndo, onRedo }: any) => (
  <React.Fragment>
    <IconButton style={buttonStyle} onClick={onUndo} disabled={!canUndo} size="small">
      <UndoIcon />
    </IconButton>
    <IconButton style={buttonStyle} onClick={onRedo} disabled={!canRedo} size="small">
      <RedoIcon />
    </IconButton>
  </React.Fragment>
);
// let UndoRedo = ({ canUndo, canRedo, onUndo, onRedo }:any) => (
//     <React.Fragment>
//         <button onClick={onUndo} disabled={!canUndo} title="Undo" className="btn btn-light">
//         ⟲
//         </button>
//         <button onClick={onRedo} disabled={!canRedo} title="Redo" className="btn btn-light">
//         ⟳
//         </button>
//     </React.Fragment>
// );

const mapStateToProps = (state: any) => {
  return {
    canUndo: state.browser.past.length > 0,
    canRedo: state.browser.future.length > 0
  }
};

const mapDispatchToProps = (dispatch: any) => {
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
