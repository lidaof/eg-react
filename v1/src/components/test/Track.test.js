/**
 * Tests for the Track abstract component.  We define some dummy classes in this suite so we can actually instantiate
 * these abstract classes.
 * 
 * @author Silas Hsu
 */
import React from 'react';
import { shallow } from 'enzyme';

import Track from '../Track';
import TrackModel from '../../model/TrackModel';
import makeToyRegion from '../../model/test/toyRegion';
import DataSource from '../../dataSources/DataSource';

/**
 * Promise wrapper for window.setTimeout.
 * 
 * @param {number} howLong - how long delay promise resolution
 * @return {Promise<void>} a Promise that resolves after a delay
 */
function wait(howLong) {
    return new Promise((resolve, reject) => {
        window.setTimeout(resolve, howLong);
    });
}

class DelayedDataSource extends DataSource {
    static DEFAULT_DELAY = 50;
    static DEFAULT_RESOLVE_VALUE = "Wow very data";

    /**
     * Makes a DataSource that resolves with data after a delay.
     * 
     * @param {number} [delay] - delay in milliseconds.  Default: DelayedDataSource.DEFAULT_DELAY
     * @param {any} [resolveValue] - data that this source will return
     */
    constructor(delay=DelayedDataSource.DEFAULT_DELAY, resolveValue=DelayedDataSource.DEFAULT_RESOLVE_VALUE) {
        super();
        this.delay = delay;
        this.resolveValue = resolveValue;
    }

    /**
     * @return {Promise<string>} Promise for string that resolves after a delay specified by the constructor
     * @override
     */
    getData() {
        return wait(this.delay).then(() => this.resolveValue);
    }
}

class ErrorDataSource extends DataSource {
    static theError = new Error("Something went wrong");

    getData() {
        return Promise.reject(ErrorDataSource.theError);
    }
}

/**
 * A track that uses DelayedDataSource with default delay.
 */
class DummyTrack extends Track {
    makeDefaultDataSource() {
        return new DelayedDataSource();
    }
}

function renderDummyTrack() {
    return shallow(<DummyTrack trackModel={new TrackModel()} viewRegion={makeToyRegion()} />);
}

/**
 * These tests must run in order, since we use the same wrapper for all of them!
 */
describe('Track', () => {
    it("Sets loading state while data is loading", () => {
        let wrapper = renderDummyTrack();
        expect(wrapper.state("isLoading")).toBe(true);
    });

    it("Sets `state.data` when data is finished loading", async () => {
        let wrapper = renderDummyTrack();
        await wait(DelayedDataSource.DEFAULT_DELAY + 50); // Wait for the data source to deliver data
        expect(wrapper.state("isLoading")).toBe(false);
        expect(wrapper.state("data")).toBe(DelayedDataSource.DEFAULT_RESOLVE_VALUE);
    });

    it("Uses the dataSourceOverride prop and sets the error state if there is an error", async () => {
        let wrapper = renderDummyTrack();
        wrapper.setProps({dataSourceOverride: new ErrorDataSource(), viewRegion: makeToyRegion()});
        await wait(50); // Wait for state changes...
        expect(wrapper.state("error")).toBe(ErrorDataSource.theError);
    });

    it("Fetches more data when the view region changes (also tests the onNewData prop)", async () => {
        let dataCallback = jest.fn();
        let wrapper = shallow(
            <DummyTrack
                trackModel={new TrackModel()}
                viewRegion={makeToyRegion()}
                onNewData={dataCallback}
                dataSourceOverride={new DelayedDataSource(0)}
            />
        );
        await wait(DelayedDataSource.DEFAULT_DELAY + 50);
        // Should be done loading the data by now
        wrapper.setProps({viewRegion: makeToyRegion()});
        await wait(DelayedDataSource.DEFAULT_DELAY + 50); // Wait for data to come in again
        expect(dataCallback).toHaveBeenCalledTimes(2);
    });

    it("Only updates data if the view region is up to date too", async () => {
        const source1 = new DelayedDataSource(300, "Data for region 1");
        const source2 = new DelayedDataSource(0, "Data for region 2");
        // So, region2 will be the final region for which data should be displayed.  However, data for region 1 will
        // come in after that.  After that, the Track's data should still be region 2's data.
        let wrapper = shallow(
            <DummyTrack
                trackModel={new TrackModel()}
                viewRegion={makeToyRegion()}
                dataSourceOverride={source1}
            />
        );
        // The shallow render will kick off a request for data.  Then, immediately...
        wrapper.setProps({dataSourceOverride: source2, viewRegion: makeToyRegion()});
        await wait(350); // Wait long enough for the data for region 1 to come in
        expect(wrapper.state("data")).toBe("Data for region 2");
    });
});
