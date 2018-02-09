import React from 'react';
import DataSource from '../../dataSources/DataSource';

/**
 * An object containing all the information the Track component needs to render.
 * 
 * @author Silas Hsu
 */
interface TrackSubtype {
    /**
     * A function that provides a DataSource given the props passed to Track.  Only called ONCE on Track creation.  This
     * property is optional; if none is provided, the legend and visualizer will receive no data.
     */
    getDataSource?(props: Object): DataSource;

    /**
     * The legend to render.  Will recieve LEGEND_PROP_TYPES from Track.  This should be a React Component class; not a
     * JSX.Element or ReactElement.
     */
    legend?(props: Object): React.Component;

    /**
     * The visualizer to render.  Will recieve VISUALIZER_PROP_TYPES from Track.  This should be a React Component
     * class; not a JSX.Element or ReactElement.
     */
    visualizer(props: Object): React.Component;
}

export default TrackSubtype;
