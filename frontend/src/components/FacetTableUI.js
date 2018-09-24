import React from 'react';
import {Tabs, Tab} from 'react-bootstrap-tabs';
import FacetTable from './trackManagers/FacetTable';

class FacetTableUI extends React.Component {

    render() {
        const {publicTracksPool, customTracksPool, addedTracks, onTracksAdded} = this.props;
        return (
            <Tabs>
                <Tab label="Public tracks facet table">
                {
                    publicTracksPool.length > 0 ?
                        <FacetTable
                            tracks={publicTracksPool}
                            addedTracks={addedTracks}
                            onTracksAdded={onTracksAdded}
                        /> :
                        <p>No public tracks from data hubs yet.  Load a hub first.</p>
                }
                </Tab>
                <Tab label="Custom tracks facet table">
                    {
                        customTracksPool.length > 0 ?
                        <FacetTable
                            tracks={customTracksPool}
                            addedTracks={addedTracks}
                            onTracksAdded={onTracksAdded}
                        /> :
                        <p>No custom tracks yet. Submit custom tracks or load custom data hub.</p>
                    }
                </Tab>
            </Tabs>
        );
    }
}

export default FacetTableUI;