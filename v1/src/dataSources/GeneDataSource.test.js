import GeneDataSource from './GeneDataSource';
import makeToyRegion from '../model/toyRegion';
import $ from 'jquery';

jest.mock('jquery');
jest.mock('../model/Gene');

$.ajax.mockReturnValue({
    done: (callback) => {
        callback([{}]);
        return {
            fail: callback => callback()
        };
    }
});

const INSTANCE = new GeneDataSource();
const region = makeToyRegion();
region.setRegion(0, 20);

it('requests data from each region and then combines them', function() {
    return INSTANCE.getData(region).then((data) => {
        expect(data).toEqual([{}, {}]);
    });
});
