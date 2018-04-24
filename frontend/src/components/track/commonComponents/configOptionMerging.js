import React from 'react';
import PropTypes from 'prop-types';
import getComponentName from '../../getComponentName';
import TrackModel from '../../../model/TrackModel';


function configOptionMerging(toMerge={}) {
    return withOptionMerging.bind(null, toMerge);
}

function withOptionMerging(toMerge, WrappedComponent) {
    return class extends React.Component {
        static displayName = `withDefaultOptions(${getComponentName(WrappedComponent)})`;
        static propTypes = {
            trackModel: PropTypes.instanceOf(TrackModel).isRequired,
            options: PropTypes.object
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
