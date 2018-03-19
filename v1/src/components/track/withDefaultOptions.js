import React from 'react';
import PropTypes from 'prop-types';
import TrackModel from '../../model/TrackModel';

/**
 * Converts a component to one that automatically merges TrackModels' options into default options.  The wrapped
 * component will recieve the merged options as a prop.
 * 
 * @param {React.Component} WrappedComponent - Component to wrap
 * @param {Object} [defaultOptions] - options to merge
 * @return {React.Component} component that merges TrackModels' options into default options
 * @author Silas Hsu
 */
function withDefaultOptions(WrappedComponent, defaultOptions) {
    return class extends React.Component {
        static propTypes = {
            trackModel: PropTypes.instanceOf(TrackModel).isRequired
        };

        constructor(props) {
            super(props);
            this.options = Object.assign({}, defaultOptions, props.trackModel.options);
        }

        /**
         * Performs a new merge of options objects, if they have changed.
         * 
         * @param {Object} nextProps - next props the component will recieve
         */
        componentWillUpdate(nextProps) {
            if (this.props.trackModel.options !== nextProps.trackModel.options) {
                this.options = Object.assign({}, defaultOptions, nextProps.trackModel.options);
            }
        }

        render() {
            return <WrappedComponent options={this.options} {...this.props} />
        }
    }
}

export default withDefaultOptions;
