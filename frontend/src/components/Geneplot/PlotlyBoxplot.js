import React, { Component } from 'react';
import PropTypes from 'prop-types';
// simplest method: uses precompiled complete bundle from `plotly.js`
// import Plot from 'react-plotly.js'; // this increases bundle size so much
import Plotly from 'plotly.js-cartesian-dist';
// customizable method: use your own `Plotly` object
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);

/**
 * this component uses plotly library for gene plotting
 * @author Daofeng Li
 */

class PlotlyBoxplot extends Component {
  static propTypes = {
    data: PropTypes.array,
    layout: PropTypes.object,
    config: PropTypes.object,
    showlegend: PropTypes.bool,
  }

  static defaultProps = {
    layout: {
      width: 900, height: 600, title: 'Geneplot', showlegend: false,
      margin: {
        l: 180
      },
    },
    config: {
      toImageButtonOptions: {
        format: 'svg', // one of png, svg, jpeg, webp
        filename: 'gene_plot',
        height: 600,
        width: 900,
        scale: 1, // Multiply title/legend/axis/canvas sizes by this factor
      },
      displaylogo: false,
      responsive: true,
      modeBarButtonsToRemove: ['select2d', 'lasso2d', 'toggleSpikelines'],
    }
  }

  constructor(props){
    super(props);
  }

  /**
   * example data
   * data={[
          {
            y: [1, 2, 3, 4, 4, 4, 8, 9, 10],
            type: 'box',
            name: 'Sample A',
            marker:{
              color: 'rgb(214,12,140)'
            }
          },
          {
            y: [2, 3, 3, 3, 3, 5, 6, 6, 7],
            type: 'box',
            name: 'Sample B',
            marker:{
              color: 'rgb(0,128,128)'
            }
          },
        ]}
   */
  render() {
    const {data, layout, config, showlegend} = this.props;
    const layout2 = showlegend ? {...layout, showlegend: showlegend}: layout;
    if(!data){
      return null;
    }
    return (
      <Plot
        data={data}
        layout={layout2}
        config={config}
      />
    );
  }
}

export default PlotlyBoxplot;