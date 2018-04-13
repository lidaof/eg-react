import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { scaleLinear } from 'd3-scale';
import TrackLegend from './TrackLegend';
import TrackModel from '../../model/TrackModel';

/**
 * A TrackLegend specialized in displaying an axis for numerical data.
 * 
 * @author Silas Hsu
 */
class NumericalLegend extends React.PureComponent {
    static propTypes = {
        trackModel: PropTypes.instanceOf(TrackModel).isRequired,
        height: PropTypes.number.isRequired,
        data: PropTypes.arrayOf(PropTypes.object).isRequired,
        getDataValue: PropTypes.func.isRequired, // Callback for getting the value of each record in `data`
        topPadding: PropTypes.number,
        bottomPadding: PropTypes.number,
        style: PropTypes.object,
    };

    static defaultProps = {
        topPadding: 0,
        bottomPadding: 0,
    };

    render() {
        const {trackModel, height, data, getDataValue, topPadding, bottomPadding, style} = this.props;
        let scale = null;
        if (data.length > 0) {
            const dataMin = Math.min(0, getDataValue(_.minBy(data, getDataValue)));
            const dataMax = getDataValue(_.maxBy(data, getDataValue));
            scale = scaleLinear().domain([dataMax, dataMin]).range([topPadding, height - bottomPadding]);
        }
        return <TrackLegend
            trackModel={trackModel}
            height={height}
            scaleForAxis={scale}
            style={style}
        />;
    }
}

export default NumericalLegend;
