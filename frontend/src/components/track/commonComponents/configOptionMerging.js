import React from 'react';
import PropTypes from 'prop-types';
import getComponentName from '../../getComponentName';
import TrackModel from '../../../model/TrackModel';

/**
 * A function that constructs a higher-order component.  It returns a function that enhances Component classes, such
 * that returned components will receive merged track options in the `options` prop.  The merging will be done with the
 * following priority, such that higher-priority values will override lower ones:
 *  1. `toMerge` parameter passed to this function (lowest priority)
 *  2. `options` prop passed by parent
 *  3. Options within TrackModel passed by parent (highest priority)
 * 
 * Thus, if multiple of these components are nested, the outermost options will override inner ones.
 * 
 * Consumed props:
 *  - `options`
 * 
 * Injected props:
 *  - `options` - merged options
 * 
 * @param {DataProcessor} dataProcessor - the data processor to give to components
 * @return {function} function that returns Component classes that use the data processor
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

        componentWillReceiveProps(nextProps) {
            if (this.props.trackModel.options !== nextProps.trackModel.options) {
                this.setState({options: this.getMergedOptionsObject(nextProps)});
            }
        }

        getMergedOptionsObject(props) {
            return Object.assign({}, props.options, toMerge, props.trackModel.options);
        }

        render() {
            return <WrappedComponent {...this.props} options={this.state.options} />;
        }
    }
}

export default configOptionMerging;
