import React from 'react';
import DataSource from '../../dataSources/DataSource';

/**
 * An object containing all the information the Track component needs to render.
 * 
 * @author Silas Hsu
 */
interface TrackSubtype {
    /**
     * The visualizer to render.  Will recieve VISUALIZER_PROP_TYPES from Track.  This should be a React Component
     * class; not a JSX.Element or ReactElement.
     */
    visualizer: React.Component;

    /**
     * The legend to render.  Will recieve LEGEND_PROP_TYPES from Track.  This should be a React Component class; not a
     * JSX.Element or ReactElement.
     */
    legend: React.Component;

    /**
     * Context menu items.
     */
    menuItems?: React.Component[];

    /**
     * Default options; should be the same schema as track model's `options` prop.  Visualizers, legends, and context
     * menu items will receive an options prop which is the track model's options merged into the default options for
     * the track type.
     */
    defaultOptions?: Object;

    /**
     * A function that provides a DataSource given the props passed to Track.  Only called ONCE on Track creation.  If
     * none is provided, then the legend and visualizer will receive no data.
     * 
     * @param {Object} props - props that Track receives
     * @return {DataSource} data source for the track
     */
    getDataSource?(props: Object): DataSource;

    /**
     * Sometimes, the data from a DataSource might need some processing or formatting before use.  If this function is
     * specified, any data will first pass through this function before being going to legend and visualizer.
     * 
     * We have this function as part of Track instead of DataSource, because view regions can change faster than data
     * sources can fetch data.  If processing happens in DataSource, it could waste work if the view region becomes
     * out-of-date.
     * 
     * @param {any} data - data from the track's data source
     * @param {Object} props - current Track props
     */
    processData?(data: any, props: Object): any;
}

export default TrackSubtype;
