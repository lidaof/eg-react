import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import getComponentName from '../../getComponentName';
import TrackModel from '../../../model/TrackModel';

/**
 * A function that constructs a higher-order component.  It returns a function that enhances Component classes, such
 * that returned components will receive merged track options in the `options` prop.  The merging will be done such that
 * the `options` prop from parents will take priority.  Thus, if multiple of these components are nested, the outermost
 * options will override inner ones.
 * 
 * Consumed props:
 *  - `options`
 * 
 * Injected props:
 *  - `options` - merged options
 * 
 * @param {Object} toMerge - options to merge
 * @return {function} function that returns Component classes that receive merged options in the `options` prop
 * @author Silas Hsu
 */
function configOptionMerging(toMerge={}) {
    return withOptionMerging.bind(null, toMerge);
}
configOptionMerging.INJECTED_PROPS = {
    options: PropTypes.object
};

/**
 * Helper for {@link configOptionMerging}.
 * 
 * @param {Object} toMerge - properties to merge
 * @param {typeof React.Component} WrappedComponent - component class to enhance
 * @return {tyoeof React.Component} component class that receives merged options in the `options` prop
 */
function withOptionMerging(toMerge, WrappedComponent) {
    return class extends React.Component {
        static displayName = `withDefaultOptions(${getComponentName(WrappedComponent)})`;
        static propTypes = {
            trackModel: PropTypes.instanceOf(TrackModel), // Track model object containing options
            options: PropTypes.object // Already-existing options
        };

        static defaultProps = {
            trackModel: {}
        };

        /**
         * Initializes data source and state.
         * 
         * @param {Object} props - props as specified by React
         */
        constructor(props) {
            super(props);
            this.state = {
                options: this.getMergedOptionsObject(props)
            };
        }

        UNSAFE_componentWillReceiveProps(nextProps) {
            if (!_.isEqual(this.props.options, nextProps.options)) { // Deep comparison
                this.setState({options: this.getMergedOptionsObject(nextProps)});
            }
        }

        getMergedOptionsObject(props) {
            return Object.assign({}, toMerge, props.options);
        }

        render() {
            return <WrappedComponent {...this.props} options={this.state.options} />;
        }
    };
}

export default configOptionMerging;
