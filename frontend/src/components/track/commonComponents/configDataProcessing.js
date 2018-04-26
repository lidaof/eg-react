import React from 'react';
import PropTypes from 'prop-types';
import getComponentName from '../../getComponentName';

/**
 * A function that constructs a higher-order component.  It returns a function that enhances Component classes, such
 * that returned components will receive `data` already modified by the configured DataProcessor.
 * 
 * Consumed props:
 *  - `data`
 * 
 * Injected props:
 *  - `data` - data processed by the data processor
 * 
 * @param {DataProcessor} dataProcessor - the data processor to give to components
 * @return {function} function that returns Component classes that use the data processor
 * @author Silas Hsu
 */
function configDataProcessing(dataProcessor) {
    return withDataProcessing.bind(null, dataProcessor);
}
configDataProcessing.INJECTED_PROPS = {
    data: PropTypes.any
};

/**
 * Helper for {@link configDataProcessing}.
 * 
 * @param {DataProcessor} dataProcessor - data processor to use
 * @param {typeof React.Component} WrappedComponent - component class to enhance
 * @return {tyoeof React.Component} component class that receives already-processed data in the `data` prop
 */
function withDataProcessing(dataProcessor, WrappedComponent) {
    return class extends React.Component {
        static displayName = `withDataProcessing(${getComponentName(WrappedComponent)})`;

        static propTypes = dataProcessor.getInputPropTypes();

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
            return <WrappedComponent {...otherProps} data={this.state.processedData} />;
        }
    }
}

export default configDataProcessing;
