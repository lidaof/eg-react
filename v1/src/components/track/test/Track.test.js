/**
 * Tests for the Track abstract component.  We define some dummy classes in this suite so we can actually instantiate
 * these abstract classes.
 * 
 * @author Silas Hsu
 */
import React from 'react';
import { shallow } from 'enzyme';

import withDataFetching from '../../withDataFetching';
import TrackModel from '../../../model/TrackModel';
import makeToyRegion from '../../../model/test/toyRegion';
import DataSource from '../../../dataSources/DataSource';

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
     * Makes a DataSource that resolves with data after a delay.  The first parameter is an array of delays in
     * milliseconds, for each successive call to getData().  If the number of calls exceeds the length of the array,
     * getData() will use the last element of the array.  The second parameter behaves like the first, except for the
     * returned data.
     * 
     * @param {number[]} [delay] - delay in milliseconds for each call to getData().  Optional.
     * @param {any} [resolveValues] - data that this source will return for each call to getData().  Optional.
     */
    constructor(delays=[DelayedDataSource.DEFAULT_DELAY], resolveValues=[DelayedDataSource.DEFAULT_RESOLVE_VALUE]) {
        super();
        this.delays = delays;
        this.resolveValues = resolveValues;
        this.calls = 0;
    }

    /**
     * @return {Promise<string>} Promise for string that resolves after a delay specified by the constructor
     * @override
     */
    getData() {
        let delay = this.delays[Math.min(this.calls, this.delays.length - 1)];
        let resolveValue = this.resolveValues[Math.min(this.calls, this.resolveValues.length - 1)];
        this.calls++;
        return wait(delay).then(() => resolveValue);
    }
}

class ErrorDataSource extends DataSource {
    static theError = new Error("Something went wrong");

    getData() {
        return Promise.reject(ErrorDataSource.theError);
    }
}

describe('withDataFetching', () => {
    const DataFetching = withDataFetching(React.Component, () => new DelayedDataSource());
    const ErrorFetching = withDataFetching(React.Component, () => new ErrorDataSource());
    const REGION = makeToyRegion();

    it("Renders a component with the right props", () => {
        let wrapper = shallow(<DataFetching viewRegion={REGION} someProp="wow very prop"/>);
        expect(wrapper.prop("someProp")).toBe("wow very prop");
    })

    it("Renders with isLoading=true initially", () => {
        let wrapper = shallow(<DataFetching viewRegion={REGION} />);
        expect(wrapper.prop("isLoading")).toBe(true);
    });

    it("Sets the data prop when finished loading", async () => {
        let wrapper = shallow(<DataFetching viewRegion={REGION} />);
        await wait(DelayedDataSource.DEFAULT_DELAY + 50); // Wait for the data source to deliver data
        expect(wrapper.prop("isLoading")).toBe(false);
        expect(wrapper.prop("data")).toBe(DelayedDataSource.DEFAULT_RESOLVE_VALUE);
    });

    it("Sets the error prop when finished loading", async () => {
        let wrapper = shallow(<ErrorFetching viewRegion={REGION} />);
        await wait(DelayedDataSource.DEFAULT_DELAY + 50); // Wait for the data source to deliver data
        expect(wrapper.prop("isLoading")).toBe(false);
        expect(wrapper.prop("error")).toBe(ErrorDataSource.theError);
    });

    it("Fetches more data when the view region changes (also tests the onNewData prop)", async () => {
        let dataCallback = jest.fn();
        let wrapper = shallow(<DataFetching viewRegion={REGION} onNewData={dataCallback} />);
        await wait(DelayedDataSource.DEFAULT_DELAY + 50);
        expect(dataCallback).toHaveBeenCalledTimes(1);

        wrapper.setProps({viewRegion: makeToyRegion()});
        expect(wrapper.prop("isLoading")).toBe(true);
        await wait(DelayedDataSource.DEFAULT_DELAY + 50);
        expect(dataCallback).toHaveBeenCalledTimes(2);
    });

    it("Only updates data if the view region is up to date too", async () => {
        const DataFetching2 = withDataFetching(
            React.Component, () => new DelayedDataSource([300, 0], ["Region1 data", "Region2 data"])
        );
        // The render will fire off a request for region 1, 300ms delay.
        let wrapper = shallow(<DataFetching2 viewRegion={REGION} />);
        
        // Immediately, make the component update -- request for region 2, 0ms delay
        wrapper.setProps({viewRegion: makeToyRegion()});

        await wait(350); // Wait long enough for the data for region 1 to come in
        expect(wrapper.prop("data")).toBe("Region2 data");
    });
});
