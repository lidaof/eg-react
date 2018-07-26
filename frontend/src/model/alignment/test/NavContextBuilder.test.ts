import { NavContextBuilder } from '../NavContextBuilder';
import { CHROMOSOMES } from '../../test/toyRegion';
import NavigationContext from '../../NavigationContext';

const BASE_NAV_CONTEXT = new NavigationContext('test', CHROMOSOMES);
// Should result in: chr1 | GAP | chr2 | chr3 | GAP | chr3 | GAP | chr3
const GAPS = [
    {
        contextBase: 10,
        length: 5
    },
    {
        contextBase: 22,
        length: 5,
    },
    {
        contextBase: 26,
        length: 5,
    }
];

test('build() works correctly', () => {
    const instance = new NavContextBuilder(BASE_NAV_CONTEXT);
    instance.setGaps(GAPS);
    const newNavContext = instance.build();
    expect(newNavContext.getTotalBases()).toBe(BASE_NAV_CONTEXT.getTotalBases() + 15);
    expect(newNavContext.getFeatures().map(feature => feature.getLength())).toEqual([
        10,  5,   10,   2,        5,   4,        5,   4
    // chr1, GAP, chr2, chr3:0-2, GAP, chr3:2-6, GAP, chr3:6-10
    ]);
});

test('convertOldContextBase() works correctly', () => {
    const instance = new NavContextBuilder(BASE_NAV_CONTEXT);
    instance.setGaps(GAPS);
    instance.build();
    expect(instance.convertOldCoordinates(5)).toBe(5);
    expect(instance.convertOldCoordinates(10)).toBe(10);
    expect(instance.convertOldCoordinates(11)).toBe(16);
    expect(instance.convertOldCoordinates(25)).toBe(35);
    expect(instance.convertOldCoordinates(30)).toBe(45);
});
