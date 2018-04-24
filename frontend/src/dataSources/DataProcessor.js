/**
 * An abstract processor of data.  Converts, filters, aggregates, does whatever is necessary to props of a React
 * component.  This object is meant to be used with the `withDataProcessing` HOC.
 * 
 * @author Silas Hsu
 */
class DataProcessor {
    /**
     * Similar to `shouldComponentUpdate` of React components, this function should get whether data should be
     * processed given a change in props.
     * 
     * @param {Object} prevProps - previous props of a component
     * @param {Object} nextProps - next props of a component
     * @return {boolean} whether data processing should happen
     */
    shouldProcess(prevProps, nextProps) {
        return prevProps.data !== nextProps.data;
    }

    /**
     * Runs data processing on any of a component's props.
     * 
     * @param {Object} props - a React component's props
     * @return {any} processed data
     */
    process(props) {
        return props.data;
    }
}

export default DataProcessor;
