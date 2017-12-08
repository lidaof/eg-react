import React from 'react';
import PropTypes from 'prop-types';

import DisplayedRegionModel from '../model/DisplayedRegionModel';
import RegionExpander from '../model/RegionExpander';

/**
 * A callback for getting a DataSource
 *
 * @callback dataSourceGetter
 * @param {Object} props - all props passed to the component
 * @return {DataSource} - a DataSource, which may or may not depend on the props
 */

/**
 * A function that returns a Component that automatically fetches data when the view region prop changes.  Wrapped
 * components, in addition to receiving all props passed to the wrapper, will also receive props `data`, `isLoading`,
 * and `error`, which are the states of data fetch.
 * 
 * The second parameter is a callback function that is called only once on component creation; use this to customize
 * what data to fetch.
 * 
 * @param {React.Component} WrappedComponent - Component to wrap
 * @param {dataSourceGetter} getDataSource - callback to get a DataSource
 * @return {React.Component} Component that automatically fetches data
 * @author Silas Hsu
 */
function withDataFetching(WrappedComponent, getDataSource) {
    return class extends React.Component {
        static displayName = `WithDataFetching(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`

        static propTypes = {
            viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // The region to fetch
            viewExpansionValue: PropTypes.number, // How much to enlarge view on both sides
            onNewData: PropTypes.func, // Callback for when new data comes in.  Signature: (): void
        };

        static defaultProps = {
            viewExpansionValue: 0,
            onNewData: () => undefined
        };

        /**
         * Initializes state and immediately sends a request for data.
         * 
         * @param {object} props 
         */
        constructor(props) {
            super(props);
            this.state = {
                isLoading: true,
                data: [],
                error: null,
            }
            this.dataSource = getDataSource(props);
            this.fetchData = this.fetchData.bind(this);
            this.fetchData(this.props);
        }
    
        /**
         * Uses this track's DataSource to fetch data within a view region, and then sets state.
         * 
         * @param {Object} props - props object; contains the region for which to fetch data
         * @return {Promise<any>} a promise that resolves when fetching is done, including when there is an error.
         */
        fetchData(props) {
            let expandedRegion = new RegionExpander(props.viewExpansionValue).makeExpandedRegion(props.viewRegion);
            return this.dataSource.getData(expandedRegion).then(data => {
                // When the data finally comes in, be sure it is still what the user wants
                if (this.props.viewRegion === props.viewRegion) {
                    this.setState({
                        isLoading: false,
                        data: data,
                        error: null,
                    });
                    this.props.onNewData();
                }
            }).catch(error => {
                if (this.props.viewRegion === props.viewRegion) {
                    this.setState({
                        isLoading: false,
                        error: error,
                    });
                }
            });
        }
    
        /**
         * If the view region has changed, sends a request for data
         * 
         * @param {object} prevProps - previous props
         * @override
         */
        componentWillReceiveProps(nextProps) {
            if (this.props.viewRegion !== nextProps.viewRegion) {
                this.setState({isLoading: true});
                this.fetchData(nextProps);
            }
        }

        /**
         * Calls cleanUp on the associated DataSource.
         */
        componentWillUnmount() {
            this.dataSource.cleanUp();
        }

        render() {
            return (
            <WrappedComponent
                data={this.state.data} 
                isLoading={this.state.isLoading}
                error={this.state.error}
                {...this.props}
            />
            );
        }
    }
}

export default withDataFetching;
