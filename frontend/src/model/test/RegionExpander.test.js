import RegionExpander from '../RegionExpander';
import makeToyRegion from './toyRegion';

var instance;

beforeEach(() => {
    instance = new RegionExpander(1);
});

it('expands a region in the middle of the genome correctly', () => {
    let region = makeToyRegion(10, 15);
    let expansion = instance.calculateExpansion(region.getWidth(), region); // 1 base per pixel
    expect(expansion.viewRegion.getAbsoluteRegion()).toEqual({
        start: 5,
        end: 20
    });
    expect(expansion.width).toEqual(15);
    expect(expansion.viewWindow.start).toEqual(5);
    expect(expansion.viewWindow.end).toEqual(10);
    
});

it('expands a region on the edge of the genome correctly', () => {
    let region = makeToyRegion(0, 5);
    let expansion = instance.calculateExpansion(region.getWidth(), region); // 1 base per pixel
    expect(expansion.viewRegion.getAbsoluteRegion()).toEqual({
        start: 0,
        end: 15
    });
    expect(expansion.width).toEqual(15);
    expect(expansion.viewWindow.start).toEqual(0);
    expect(expansion.viewWindow.end).toEqual(5);
});

it('does not modify a region that already spans the entire genome', () => {
    let region = makeToyRegion(0, 30);
    let expansion = instance.calculateExpansion(region.getWidth(), region); // 1 base per pixel
    expect(expansion.viewRegion.getAbsoluteRegion()).toEqual({
        start: 0,
        end: 30
    });
    expect(expansion.width).toEqual(30);
    expect(expansion.viewWindow.start).toEqual(0);
    expect(expansion.viewWindow.end).toEqual(30);
});
