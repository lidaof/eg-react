import React from 'react';
import PropTypes from 'prop-types';
import getComponentName from '../../getComponentName';
import TrackModel from '../../../model/TrackModel';

/**
 * 
 * @param {function} getDataSource 
 * @param {any} defaultData 
 * @return {function}
 */
function configDefaultOptions(defaultOptions) {
    return withDefaultOptions.bind(null, defaultOptions);
}

function withDefaultOptions(defaultOptions, WrappedComponent) {
    return class extends React.Component {
        static displayName = `withDefaultOptions(${getComponentName(WrappedComponent)})`;
        static propTypes = {
            trackModel: PropTypes.instanceOf(TrackModel).isRequired
        };

        /**
         * Initializes data source and state.
         * 
         * @param {Object} props - props as specified by React
         */
        constructor(props) {
            super(props);
            this.state = {
                options: this.getMergedOptionsObject(props.trackModel.options)
            };
        }

        componentWillReceiveProps(nextProps) {
            if (this.props.trackModel.options !== nextProps.trackModel.options) {
                this.setState({options: this.getMergedOptionsObject(nextProps.trackModel.options)});
            }
        }

        getMergedOptionsObject(trackOptions) {
            return Object.assign({}, defaultOptions, trackOptions);
        }

        render() {
            return <WrappedComponent {...this.props} options={this.state.options} />;
        }
    }
}

export default configDefaultOptions;
