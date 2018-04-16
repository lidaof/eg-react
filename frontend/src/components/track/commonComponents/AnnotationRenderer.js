import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import LinearDrawingModel from '../../../model/LinearDrawingModel';
import Feature from '../../../model/Feature';
import DisplayedRegionModel from '../../../model/DisplayedRegionModel';
import IntervalArranger from '../../../art/IntervalArranger';

class AnnotationRenderer extends React.PureComponent {
    static propTypes = {
        features: PropTypes.arrayOf(PropTypes.instanceOf(Feature)).isRequired,
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
        width: PropTypes.number.isRequired,
        numRows: PropTypes.number.isRequired,
        rowHeight: PropTypes.number.isRequired,
        getAnnotationElement: PropTypes.func.isRequired,
        getHorizontalPadding: PropTypes.func,
    };

    static defaultProps = {
        getHorizontalPadding: feature => 0,
    }

    render() {
        const {features, viewRegion, width, numRows, rowHeight, getHorizontalPadding, getAnnotationElement} = this.props;
        // Compute absolute intervals of all the features
        const navContext = viewRegion.getNavigationContext();
        const intervals = _.flatMap(features, feature => feature.computeNavContextCoordinates(navContext));

        // Arrange all the absolute intervals (rowAssignments)
        const drawModel = new LinearDrawingModel(viewRegion, width);
        const paddingCallback = interval => getHorizontalPadding(interval.feature);
        const intervalArranger = new IntervalArranger(drawModel, numRows - 1, paddingCallback);
        const rowAssignments = intervalArranger.arrange(intervals);

        return intervals.map((interval, i) => {
            const rowIndex = rowAssignments[i];
            const isLastRow = rowIndex < 0;
            const effectiveRowIndex = isLastRow ? numRows - 1 : rowIndex;
            const y = effectiveRowIndex * rowHeight;
            return getAnnotationElement(interval.feature, interval, y, isLastRow)
        });
    }
}

export default AnnotationRenderer;
