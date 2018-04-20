import React from 'react';
import PropTypes from 'prop-types';
import DisplayedRegionModel from '../../../model/DisplayedRegionModel';
import getComponentName from '../../getComponentName';

/**
 * A function that constructs a higher-order component.  This HOC will automatically fetch data when view region
 * changes, using the fetch configuration given to this function.  It will then pass the data to the wrapped component
 * in the `data` prop.
 * 
 * The first paramter is a callback for getting a DataSource, signature (props: Object): DataSource.  It will be passed
 * initial props, and should return a DataSource.  It will be called only ONCE on element initialization.
 * 
 * @param {function} getDataSource - callback for getting a DataSource
 * @param {any} initialData - initial data to pass to wrapped components
 * @param {RegionExpander} [regionExpander] - object that expands the region before fetching
 * @return {function} function that wraps React components
 */
function configDataFetch(getDataSource, initialData, regionExpander) {
    return withDataFetch.bind(null, getDataSource, initialData, regionExpander);
}

/**
 * See {@link configDataFetch}.
 * 
 * @return {React.Component} component that fetches data on view region changes
 */
export function withDataFetch(getDataSource, initialData, regionExpander, WrappedComponent) {
    return class extends React.Component {
        static displayName = `withDataFetch(${getComponentName(WrappedComponent)})`;

        static propTypes = {
            viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired
        };

        /**
         * Initializes data source and state.
         * 
         * @param {Object} props - props as specified by React
         */
        constructor(props) {
            super(props);
            this.dataSource = getDataSource(props);
            this.state = {
                data: initialData,
                isLoading: true,
                error: null,
            };
            this.fetchData(props);
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
         * Calls cleanUp on the associated DataSource.
         */
        componentWillUnmount() {
            this.dataSource.cleanUp();
        }

        /**
         * Uses this instance's DataSource to fetch data within a view region, and then sets state.
         * 
         * @return {Promise<void>} a promise that resolves when fetching is done, including when there is an error.
         */
        fetchData() {
            const requestedViewRegion = this.props.viewRegion; // Take a snapshot of this.props.viewRegion
            let regionToFetch = requestedViewRegion;
            if (regionExpander) {
                regionToFetch = regionExpander.calculateExpansion(props.width, requestedViewRegion).expandedRegion;
            }
            return this.dataSource.getData(regionToFetch, props).then(data => {
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

export default configDataFetch;
