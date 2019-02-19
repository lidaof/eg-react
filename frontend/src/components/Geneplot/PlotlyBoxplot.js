import React, { Component } from 'react';
import Plot from 'react-plotly.js';

class PlotlyBoxplot extends Component {
  render() {
    return (
      <Plot
        data={[
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
        layout={{width: 800, height: 600, title: 'Colored Box Plot',showlegend: false}}
        config = {{
          toImageButtonOptions: {
            format: 'svg', // one of png, svg, jpeg, webp
            filename: 'gene_plot',
            height: 600,
            width: 800,
            scale: 1, // Multiply title/legend/axis/canvas sizes by this factor
          },
          displaylogo: false,
          responsive: true,
          modeBarButtonsToRemove: ['select2d', 'lasso2d', 'toggleSpikelines'],
        }}
      />
    );
  }
}

export default PlotlyBoxplot;