import React from 'react';
import PropTypes from 'prop-types';
import getComponentName from '../../getComponentName';

/**
 * 
 * @param {function} getDataSource 
 * @param {any} defaultData 
 * @return {function}
 */
function configDataProcessing(dataProcessor) {
    return withDataProcessing.bind(null, dataProcessor);
}

function withDataProcessing(dataProcessor, WrappedComponent) {
    return class extends React.Component {
        static displayName = `withDataProcessing(${getComponentName(WrappedComponent)})`;

        static propTypes = {
            data: PropTypes.any
        };

        /**
         * Initializes data source and state.
         * 
         * @param {Object} props - props as specified by React
         */
        constructor(props) {
            super(props);
            this.state = {
                processedData: dataProcessor.process(props)
            };
        }

        componentWillReceiveProps(nextProps) {
            if (dataProcessor.shouldProcess(this.props, nextProps)) {
                this.setState({processedData: dataProcessor.process(nextProps)});
            }
        }

        render() {
            const {data, ...otherProps} = this.props;
            return <WrappedComponent data={this.state.processedData} {...otherProps} />;
        }
    }
}

export default configDataProcessing;
