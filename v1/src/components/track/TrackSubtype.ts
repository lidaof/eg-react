import React from 'react';
import DataSource from '../../dataSources/DataSource';

interface TrackSubtype {
    /**
     * Gets a DataSource given the props passed to Track.  Only called ONCE on Track creation.  This property is
     * optional; if none is provided, Track will use a DummyDataSource.
     */
    getDataSource?(props: Object): DataSource;

    /**
     * The legend to render.  Will recieve LEGEND_PROP_TYPES from Track.  This should be a React component CLASS; not
     * an instance.
     */
    legend(props: Object): React.Component;

    /**
     * The visualizer to render.  Will recieve VISUALIZER_PROP_TYPES from Track.  This should be a React component
     * CLASS; not an instance.
     */
    visualizer(props: Object): React.Component;
}

export default TrackSubtype;
