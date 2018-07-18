import LinearDrawingModel from '../LinearDrawingModel';
import makeToyRegion from './toyRegion';

const REGION = makeToyRegion(0, 10);
const DRAW_WIDTH = 100;
const INSTANCE = new LinearDrawingModel(REGION, DRAW_WIDTH);

test('basesToXWidth()', () => {
    expect(INSTANCE.basesToXWidth(15)).toBeCloseTo(150);
});

test('xWidthToBases()', () => {
    expect(INSTANCE.xWidthToBases(150)).toBeCloseTo(15);
});

test('baseToX()', () => {
    expect(INSTANCE.baseToX(5)).toBeCloseTo(50);
});

test('xToBase()', () => {
    expect(INSTANCE.xToBase(50)).toBeCloseTo(5);
});

test('xToSegmentCoordinate()', () => {
    const result = INSTANCE.xToSegmentCoordinate(50);
    const locus = result.getGenomeCoordinates();
    expect(locus.chr).toBe('chr1');
    expect(locus.start).toBeCloseTo(5);
});
