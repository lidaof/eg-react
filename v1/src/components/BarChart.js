import React, { Component } from 'react'
//import { scaleLinear } from 'd3-scale'
import { max } from 'd3-array'
import { select } from 'd3-selection'
//import { transition } from 'd3-transition'

const DEBUG = false;

class BarChart extends Component {
  constructor(props){
    super(props)
    this.createBarChart = this.createBarChart.bind(this)
  }

  componentDidMount() {
    this.createBarChart()
  }

  componentDidUpdate() {
    this.createBarChart()
  }

  createBarChart() {
    let [w,h] = this.props.size;
    const node = this.node;
    const dataMax = max(this.props.data);
    const barWidth = w / this.props.data.length;
    if (DEBUG) console.log([w,h,dataMax,barWidth]);
    select(node)
    //.attr("height","100%")
    //      .attr("width","100%")
      .selectAll("rect")
      .data(this.props.data)
      .enter().append("rect")
            .attr("class", "bar")
            .attr("height", function(d, i) {return (d/dataMax * h)})
            .attr("width",barWidth)
            .attr("x", function(d, i) {return (i * barWidth)})
            .attr("y", function(d, i) {return h - (d/dataMax * h)});
  }

  render() {
    return <svg ref={node => this.node = node} width={this.props.size[0]} height={this.props.size[1]}>
    </svg>
  }
}

export default BarChart;
