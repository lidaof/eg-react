import React from 'react'
//import { scaleLinear } from 'd3-scale'
import { select } from 'd3-selection'
//import { transition } from 'd3-transition'
import PropTypes from 'prop-types';
import _ from 'lodash';

/**
 * Component takes a SVG and renders a bar chart on it.
 * 
 * @author Daofeng Li and Silas Hsu
 */
class BarChart extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.object), // The data to display.  Array of BarChartRecord.
        height: PropTypes.number // The height of the svg
    }

    static defaultProps = {
        data: [],
        height: 50,
    }

    /**
     * Only updates the component if the data changes.
     * 
     * @param {object} nextProps - next props the component will receive
     */
    shouldComponentUpdate(nextProps) {
        return this.props.data !== nextProps.data;
    }

    /**
     * Renders a bar chart with d3.js.
     */
    render() {
        let non0Data = this.props.data.filter(record => record.value !== 0);
        if (non0Data.length === 0) {
            return null;
        }
        const dataMax = _.maxBy(this.props.data, record => record.value).value;
        const svgHeight = this.props.height;
        let rectSelection = select(this.props.svgNode)
            .selectAll("rect")
            .data(non0Data);

        const shapeBars = function(selection) {
            selection.attr("class", "bar")
                .attr("height", record => record.value/dataMax * svgHeight)
                .attr("width", 1)
                .attr("x", record => this.props.drawModel.baseToX(record.start))
                .attr("y", record => svgHeight - (record.value/dataMax * svgHeight) + 10)
        }.bind(this);

        shapeBars(rectSelection);
        shapeBars(rectSelection.enter().append("rect"));
        rectSelection.exit().remove();

        return null;
    }
}

export default BarChart;
