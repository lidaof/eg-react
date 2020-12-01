import React from "react";
import PropTypes from "prop-types";
import getComponentName from "../getComponentName";
import DataSource from "../../dataSources/DataSource";
import DisplayedRegionModel from "../../model/DisplayedRegionModel";

/**
 * Component classes returned by this function will automatically fetch data when view region changes, using the data
 * source passed via props.  Wrapped components will recieve three props `data`, `isLoading`, and `error`.  If
 * `isLoading` is false, the `data` prop is guaranteed to be in sync with the view region.
 *
 * Consumed props:
 *  - `dataSource`; an instance of DataSource
 *  - `dataFormatter`; a function with signature (rawDataFromDataSource: any) => formattedData: any;
 *
 * Injected props:
 *  - {any} `data`: fetched data.  Initially set to the initialData parameter.
 *  - {boolean} `isLoading`: whether data fetch is currently in progress.  Initially `true`.
 *  - {any} `error`: error object, if any errors happened during data fetch.  Initially `null`.
 *
 * @param {function} [doFormat] - data modifier function
 * @param {any} [initialData] - initial data to pass to wrapped component class.  Default is empty array.
 * @param {typeof React.Component} WrappedComponent - component class to wrap
 * @return {typeof React.Component} component class that fetches data on view region changes
 * @author Silas Hsu
 */
export function withDataFetch(initialData = [], WrappedComponent) {
    return class extends React.Component {
        static displayName = `withDataFetch(${getComponentName(WrappedComponent)})`;

        static propTypes = {
            dataSource: PropTypes.instanceOf(DataSource).isRequired, // Data source to use
            viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired // View region to fetch
        };

        /**
         * Initializes data source and state.
         *
         * @param {Object} props - props as specified by React
         */
        constructor(props) {
            super(props);
            this.state = {
                data: initialData,
                isLoading: true,
                error: null
            };
            this.fetchData(props);
        }

        /**
         * If the view region has changed, sends a request for data
         *
         * @param {object} prevProps - previous props
         * @override
         */
        UNSAFE_componentWillReceiveProps(nextProps) {
            if (this.props.viewRegion !== nextProps.viewRegion) {
                this.setState({ isLoading: true });
                this.fetchData(nextProps);
            }
        }

        /**
         * Uses this instance's DataSource to fetch data within a view region, and then sets state.
         *
         * @return {Promise<void>} a promise that resolves when fetching is done, including when there is an error.
         */
        fetchData(props) {
            const requestedViewRegion = props.viewRegion; // Take a snapshot of this.props.viewRegion
            const width = (props.width || window.innerWidth) + 1;
            const basesPerPixel = requestedViewRegion.getWidth() / width;
            const options = props.options || {};
            return this.props.dataSource
                .getData(requestedViewRegion, basesPerPixel, options)
                .then(data => {
                    // When the data finally comes in, be sure it is still what the user wants
                    if (this.props.viewRegion === requestedViewRegion) {
                        this.setState({
                            isLoading: false,
                            data: props.dataFormatter ? props.dataFormatter(data) : data,
                            error: null
                        });
                    }
                })
                .catch(error => {
                    if (this.props.viewRegion === requestedViewRegion) {
                        if (process.env.NODE_ENV !== "test") {
                            console.error(error);
                        }
                        this.setState({
                            isLoading: false,
                            error: error
                        });
                    }
                });
        }

        render() {
            const { dataSource, ...otherProps } = this.props;
            return <WrappedComponent {...this.state} {...otherProps} />;
        }
    }; // End class extends React.Component
} // End function withDataFetch(...)

withDataFetch.INJECTED_PROPS = {
    data: PropTypes.any,
    isLoading: PropTypes.bool,
    error: PropTypes.any
};

/**
 * A function that constructs a higher-order component.  It returns a function that does exactly the same thing as
 * {@link withDataFetch}, but it also configures a default data source, such that that output component classes do not
 * require props to specify a DataSource.
 *
 * The first parameter is a callback that provides this default DataSource, signature (props: Object): DataSource, where
 * `props` are the component's initial props.  This callback will be used ONCE on component initialization, and the
 * returned DataSource will persist for the life of the component.
 *
 * Same for the second parameter, but the signature is (props: Object): (rawDataFromDataSource: any) => formattedData:
 * i.e. a function that returns a data formatting function.
 *
 * Consumed props:
 *  - Same as {@link withDataFetch}
 *
 * Injected props:
 *  - Same as {@link withDataFetch}
 *
 * @param {function} getDataSource - callback for getting a DataSource
 * @param {function} [getFormatter] - data modifier function
 * @param {any} [initialData] - initial data to pass to wrapped component class.  Default is empty array.
 * @return {function} function that wraps React component classes
 * @author Silas Hsu
 */
export function configStaticDataSource(getDataSource, getFormatter, initialData = []) {
    return function(WrappedComponent) {
        return withStaticDataSource(getDataSource, getFormatter, withDataFetch(initialData, WrappedComponent));
    };
}
configStaticDataSource.INJECTED_PROPS = withDataFetch.INJECTED_PROPS;

/**
 * Helper for {@link configStaticDataSource}.
 *
 * Consumed props: none
 *
 * Injected props:
 *  - {DataSource} `dataSource`: data source gotten from the callback
 *
 * @param {function} getDataSource - callback for getting a DataSource
 * @param {typeof React.Component} WrappedComponent - component class to enhance with a DataSource
 * @return {typeof React.Component} - enhanced component class
 */
function withStaticDataSource(getDataSource, getFormatter, WrappedComponent) {
    return class extends React.Component {
        static displayName = `withStaticDataSource(${getComponentName(WrappedComponent)})`;

        constructor(props) {
            super(props);
            this.state = {
                dataSource: getDataSource(props),
                dataFormatter: getFormatter(props)
            };
        }

        componentWillUnmount() {
            this.state.dataSource.cleanUp();
        }

        render() {
            return (
                <WrappedComponent
                    dataSource={this.state.dataSource}
                    dataFormatter={this.state.dataFormatter}
                    {...this.props}
                />
            );
        }
    };
}
