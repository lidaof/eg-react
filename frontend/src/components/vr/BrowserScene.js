import React from 'react';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import VrRuler from './VrRuler';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import TrackModel from '../../model/TrackModel';

import { withDataFetch } from '../trackConfig/BigWigTrackRenderer';
import { NumericalTrack3D } from './NumericalTrack3D';
import { Ribbon } from './Ribbon';
import RegionExpander from '../../model/RegionExpander';

const COMPONENT_FOR_TRACK_TYPE = {
    bigwig: withDataFetch(NumericalTrack3D)
}

const TRACK_SEPARATION = 1; // In meters
const TRACK_WIDTH = 100;
const TRACK_HEIGHT = 1;
const REGION_EXPANDER = new RegionExpander(1);
REGION_EXPANDER.calculateExpansion = memoizeOne(REGION_EXPANDER.calculateExpansion);

export class BrowserScene extends React.Component {
    static propTypes = {
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // Region to render
        tracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)), // Array of tracks to render
    };

    static defaultProps = {
        tracks: [],
        renderTrack: trackModel => null,
        embedded: true,
        style: {
            width: 1280,
            height: 720
        }
    }

    render() {
        let {viewRegion, tracks, renderTrack, trackWidth, children, ...otherProps} = this.props;
        const expandedRegion = REGION_EXPANDER.calculateExpansion(TRACK_WIDTH, viewRegion).viewRegion;
        let z = -TRACK_SEPARATION;
        const tracksAndRulers = [];
        for (let trackModel of tracks) {
            const Component3D = COMPONENT_FOR_TRACK_TYPE[trackModel.type];
            if (!Component3D) {
                continue;
            }
            tracksAndRulers.push(
                <Component3D
                    key={trackModel.getId()}
                    trackModel={trackModel}
                    viewRegion={expandedRegion}
                    width={TRACK_WIDTH}
                    height={TRACK_HEIGHT}
                    z={z}
                    options={trackModel.options}
                />
            );
            tracksAndRulers.push(
                <VrRuler key={trackModel.getId() + "ruler"} viewRegion={expandedRegion} width={TRACK_WIDTH} z={z} />
            );
            z -= TRACK_SEPARATION;
        }

        return (
        <a-scene {...otherProps} >
            <a-sky color="#ECECEC"></a-sky>
            <a-entity camera="" position={`${TRACK_WIDTH/2} 1.6 2`} look-controls="" wasd-controls="fly: true" />
            {children}
            {tracksAndRulers}
            <Ribbon />
        </a-scene>
        );
    }
}
