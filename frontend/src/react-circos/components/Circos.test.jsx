import React from 'react';
import { shallow } from 'enzyme';
import CircosJS from 'circos';
import Circos from './Circos';
import {
  CHORDS,
  HEATMAP,
  HIGHLIGHT,
  HISTOGRAM,
  LINE,
  SCATTER,
  STACK,
  TEXT,
} from '../tracks';

jest.mock('circos');

const layoutMock = jest.fn();
const renderMock = jest.fn();

const chordsMock = jest.fn();
const heatmapMock = jest.fn();
const highlightMock = jest.fn();
const histogramMock = jest.fn();
const lineMock = jest.fn();
const scatterpMock = jest.fn();
const stackMock = jest.fn();
const textMock = jest.fn();
CircosJS.mockImplementation(() => ({
  layout: layoutMock,
  render: renderMock,

  chords: chordsMock,
  heatmap: heatmapMock,
  highlight: highlightMock,
  histogram: histogramMock,
  line: lineMock,
  scatter: scatterpMock,
  stack: stackMock,
  text: textMock,
}));

describe('Circos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should call circos.layout with expected props', () => {
    const layout = [];
    const config = {};
    shallow(<Circos layout={layout} config={config} />);
    expect(layoutMock.mock.calls.length).toEqual(1);
    expect(layoutMock.mock.calls[0][0]).toBe(layout);
    expect(layoutMock.mock.calls[0][1]).toBe(config);
  });
  it('should use {} as default config for circos.layout', () => {
    shallow(<Circos layout={[]} />);
    expect(layoutMock.mock.calls.length).toEqual(1);
    expect(layoutMock.mock.calls[0][1]).toEqual({});
  });
  it('should call circos.render', () => {
    shallow(<Circos layout={[]} />);
    expect(renderMock.mock.calls.length).toEqual(1);
  });

  describe('tracks', () => {
    const tracks = [
      { type: CHORDS, mock: chordsMock },
      { type: HEATMAP, mock: heatmapMock },
      { type: HIGHLIGHT, mock: highlightMock },
      { type: HISTOGRAM, mock: histogramMock },
      { type: LINE, mock: lineMock },
      { type: SCATTER, mock: scatterpMock },
      { type: STACK, mock: stackMock },
      { type: TEXT, mock: textMock },
    ];
    tracks.forEach(({ mock, ...track }) => {
      it(`[${track.type}] should call circos.<track>`, () => {
        shallow(<Circos layout={[]} tracks={[{ data: [], ...track }]} />);
        expect(mock.mock.calls.length).toEqual(1);
      });
    });
  });
});
