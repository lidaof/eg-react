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
     * Default options that are provided to menu item components.  These are NOT provided to anything else by default!
     */
    defaultOptions?: Object;

    /**
     * A function that provides a DataSource given the props passed to Track.  Only called ONCE on Track creation.  If
     * none is provided, then the legend and visualizer will receive no data.
     */
    getDataSource?(props: Object): DataSource;
}

export default TrackSubtype;
