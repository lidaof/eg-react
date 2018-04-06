import React from 'react';
import { Provider } from 'react-redux';
import { AppState, ActionCreators } from '../AppState';

AppState.dispatch(ActionCreators.setGenome("hg19"));

/**
 * A Redux Provider that provides a store already initialized with some sensible defaults, like a genome.
 * 
 * @param {Object} props - props as specified by React
 */
function ReduxProvider(props) {
    return <Provider store={AppState} {...props} />;
}

export default ReduxProvider;
