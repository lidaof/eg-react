import React from 'react';
import getComponentName from '../../getComponentName';

/**
 * 
 * @param {function} getDataSource 
 * @param {any} defaultData 
 * @return {function}
 */
export function configDataProcessing(processData, shouldProcessData=(prevProps, nextProps) => true) {
    return withDataProcessing.bind(null, processData, shouldProcessData);
}

function withDataProcessing(processData, shouldProcessData, WrappedComponent) {
    return class extends React.Component {
        static displayName = `withDataProcessing(${getComponentName(WrappedComponent)})`;

        /**
         * Initializes data source and state.
         * 
         * @param {Object} props - props as specified by React
         */
        constructor(props) {
            super(props);
            this.state = {
                processedData: processData(props)
            };
        }

        componentWillReceiveProps(nextProps) {
            if (shouldProcessData(this.props, nextProps)) {
                this.setState({processedData: processData(props)});
            }
        }

        render() {
            const {data, ...otherProps} = this.props;
            return <WrappedComponent data={this.processedData} {...otherProps} />;
        }
    }
}

export default configDataProcessing;
