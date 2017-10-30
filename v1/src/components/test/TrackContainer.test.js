import React from 'react';
import { shallow } from 'enzyme';

import TrackContainer from '../TrackContainer';

import BigWigTrack from '../BigWigTrack';
import GeneAnnotationTrack from '../geneAnnotationTrack/GeneAnnotationTrack';
import TrackModel from '../../model/TrackModel';
import makeToyRegion from '../../model/test/toyRegion';

const viewRegion = makeToyRegion();

describe("TrackContainer", () => {
    let wrapper = null;
    const newRegionCallback = jest.fn();
    const tracks = [
        new TrackModel({type: BigWigTrack.TYPE_NAME}),
        new TrackModel({type: GeneAnnotationTrack.TYPE_NAME}),
    ];
    const dragRegionStart = 0;
    const dragRegionEnd = 10;

    /**
     * Gets all rendered tracks of the types that we expect.
     * 
     * @param {ShallowWrapper} wrapper - the Enzyme ShallowWrapper to inspect
     * @return {ReactElement} Track elements in the wrapper
     */
    const getRenderedTracks = function(wrapper) {
        let foundTracks = [];
        const trackTypesToFind = [BigWigTrack, GeneAnnotationTrack];
        for (let type of trackTypesToFind) {
            foundTracks = foundTracks.concat(wrapper.find(type).getNodes());
        }
        return foundTracks;
    }

    beforeEach(() => {
        newRegionCallback.mockClear();
        wrapper = shallow(
            <TrackContainer
                viewRegion={viewRegion}
                newRegionCallback={newRegionCallback}
                tracks={tracks}
            />
        );
    });

    it("renders one Track for each object in the `tracks` prop", () => {
        expect(getRenderedTracks(wrapper).length).toBe(2);
    });

    it("sets tracks' xOffset prop when the view is dragged, AND resets a track's xOffset when it loads data", () => {
        let instance = wrapper.instance();
        instance.viewDragStart();
        instance.viewDrag(dragRegionStart, dragRegionEnd, undefined, {dx: 10});

        let tracks = getRenderedTracks(wrapper);
        expect(tracks.length).toBeGreaterThan(0);
        for (let track of tracks) {
            expect(track.props.xOffset).toBe(10);
        }
        
        // Start another drag!
        instance.viewDragEnd(dragRegionStart, dragRegionEnd, undefined, {dx: 10});
        instance.viewDragStart();
        instance.viewDrag(dragRegionStart, dragRegionEnd, undefined, {dx: 10});

        tracks = getRenderedTracks(wrapper);
        for (let track of tracks) {
            expect(track.props.xOffset).toBe(20);
        }

        // Let's pretend a track finished loading data!
        instance.newTrackDataCallback(0); // It's OK since earlier we asserted at least 1 rendered track
        tracks = getRenderedTracks(wrapper);
        expect(tracks[0].props.xOffset).toBe(0);
        for (let track of tracks.slice(1)) { // The rest of the tracks should not have changed.
            expect(track.props.xOffset).toBe(20);
        }
    });

    it("calls the newRegionCallback when dragging ends, IF dragged far enough", () => {
        let instance = wrapper.instance();
        instance.viewDragEnd(
            dragRegionStart, dragRegionEnd, undefined, {dx: TrackContainer.MIN_DRAG_DISTANCE_FOR_REFRESH - 1}
        );
        expect(newRegionCallback).not.toHaveBeenCalled();

        instance.viewDragEnd(
            dragRegionStart, dragRegionEnd, undefined, {dx: TrackContainer.MIN_DRAG_DISTANCE_FOR_REFRESH}
        );
        expect(newRegionCallback).toHaveBeenCalledTimes(1);
        expect(newRegionCallback).toHaveBeenCalledWith(dragRegionStart, dragRegionEnd);
    });
});
