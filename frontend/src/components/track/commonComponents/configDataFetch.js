import React from 'react';
import PropTypes from 'prop-types';
import getComponentName from '../../getComponentName';
import DataSource from '../../../dataSources/DataSource';
import DisplayedRegionModel from '../../../model/DisplayedRegionModel';
import { REGION_EXPANDER } from '../NewTrack';

/**
 * Components wrapped by this function will automatically fetch data when view region changes, using the data source
 * passed via props.  It passes the following extra props to the wrapped components:
 *  - `data`: fetched data.  It is initially `null`.
 *  - `isLoading`: whether data fetch is currently in progress
 *  - `error`: error object, if any errors happened during data fetch
 * 
 * @param {React.Component} WrappedComponent - component to wrap
 * @return {React.Component} component that fetches data on view region changes
 */
export function withDataFetch(WrappedComponent) {
    return class extends React.Component {
        static displayName = `withDataFetch(${getComponentName(WrappedComponent)})`;

        static propTypes = {
            dataSource: PropTypes.instanceOf(DataSource).isRequired,
            viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
        };

        /**
         * Initializes data source and state.
         * 
         * @param {Object} props - props as specified by React
         */
        constructor(props) {
            super(props);
            this.state = {
                data: null,
                isLoading: true,
                error: null,
            };
            this.fetchData();
        }

        /**
         * If the view region has changed, sends a request for data
         * 
         * @param {object} prevProps - previous props
         * @override
         */
        componentDidUpdate(prevProps) {
            if (this.props.viewRegion !== prevProps.viewRegion) {
                this.setState({isLoading: true});
                this.fetchData();
            }
        }

        /**
         * Uses this instance's DataSource to fetch data within a view region, and then sets state.
         * 
         * @return {Promise<void>} a promise that resolves when fetching is done, including when there is an error.
         */
        fetchData() {
            const requestedViewRegion = this.props.viewRegion; // Take a snapshot of this.props.viewRegion
            const regionToFetch = REGION_EXPANDER
                .calculateExpansion(this.props.width, requestedViewRegion)
                .expandedRegion;
            return this.props.dataSource.getData(regionToFetch, this.props).then(data => {
                // When the data finally comes in, be sure it is still what the user wants
                if (this.props.viewRegion === requestedViewRegion) {
                    this.setState({
                        isLoading: false,
                        data: data,
                        error: null,
                    });
                }
            }).catch(error => {
                if (this.props.viewRegion === requestedViewRegion) {
                    if (process.env.NODE_ENV !== 'test') {
                        console.error(error);
                    }
                    this.setState({
                        isLoading: false,
                        error: error,
                    });
                }
            });
        }

        render() {
            return <WrappedComponent {...this.props} {...this.state} />;
        }

    } // End class extends React.Component
} // End function withDataFetch(...)

/**
 * A function that constructs a higher-order component.  It returns a function that does much of the same thing as
 * `withDataFetch`, except that it configures a default data source, such that that output component classes do not
 * require a DataSource in props.
 * 
 * The first parameter is a callback that provides this default DataSource, signature (props: Object): DataSource, where
 * `props` are the component's initial props.  This callback will be used ONCE on component initialization, and the
 * returned DataSource will persist for the life of the component.
 * 
 * @param {function} getDataSource - callback for getting a DataSource
 * @return {function} function that wraps React components
 */
export function configStaticDataSource(getDataSource) {
    return function(WrappedComponent) {
        return withStaticDataSource(getDataSource, withDataFetch(WrappedComponent));
    }
}

/**
 * Helper for {@link configStaticDataSource}.
 * 
 * @param {function} getDataSource - callback for getting a DataSource
 * @param {typeof React.Component} WrappedComponent - component class to enhance with a DataSource
 * @return {typeof React.Component} - enhanced component class
 */
function withStaticDataSource(getDataSource, WrappedComponent) {
    return class extends React.Component {
        static displayName = `withStaticDataSource(${getComponentName(WrappedComponent)})`;

        constructor(props) {
            super(props);
            this.state = {
                dataSource: getDataSource(props)
            };
        }

        componentWillUnmount() {
            this.state.dataSource.cleanUp();
        }

        render() {
            return <WrappedComponent dataSource={this.state.dataSource} {...this.props} />;
        }
    }
}
