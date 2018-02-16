import {reg2bin, reg2bins} from '../binning';

test('reg2bin', () => {
    expect(reg2bin(11868, 14362)).toBe(4681);
});

test('reg2bins', () => {
    expect(reg2bins(11868, 14362)).toEqual([0, 1, 9, 73, 585, 4681]);
});