import React from 'react';
import { Provider } from 'react-redux';
import { AppState, GlobalActionCreators } from './AppState';

AppState.dispatch(GlobalActionCreators.setGenome("hg19"));

/**
 * A Redux Provider that provides a store already initialized with some sensible defaults, like a genome.
 * 
 * @param {Object} props - props as specified by React
 */
export function ReduxProvider(props) {
    return <Provider store={AppState} {...props} />;
}
