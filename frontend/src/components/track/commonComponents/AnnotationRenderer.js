import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import LinearDrawingModel from '../../../model/LinearDrawingModel';
import Feature from '../../../model/Feature';
import DisplayedRegionModel from '../../../model/DisplayedRegionModel';
import IntervalArranger from '../../../art/IntervalArranger';

/**
 * An arranger and renderer of features, or annotations.
 * 
 * @author Silas Hsu
 */
class AnnotationRenderer extends React.PureComponent {
    static propTypes = {
        features: PropTypes.arrayOf(PropTypes.instanceOf(Feature)).isRequired, // Features to render
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // View region in which to render
        width: PropTypes.number.isRequired, // Width, in pixels, of the visualization
        numRows: PropTypes.number.isRequired, // Max number of rows in which to arrange annotations
        rowHeight: PropTypes.number.isRequired, // Height of each row
        /**
         * Callback for getting an annotation element to render.  Signature:
         *     (feature: Feature, absInterval: OpenInterval, y: number, isLastRow: boolean): JSX.Element
         *         `feature`: feature for which to get annotation element
         *         `absInterval`: location of the feature in navigation context
         *         `y`: y coordinate to render the annotation
         *         `isLastRow`: whether the annotation is assigned to the last configured row
         */
        getAnnotationElement: PropTypes.func.isRequired,
        /**
         * Minimum horizontal padding to give to annotations.  If a number, it is used as a constant.  If a function, it
         * is used as a callback with signature (feature: Feature): number
         *     `feature`: feature for which to get horizontal padding
         */
        getHorizontalPadding: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
    };

    static defaultProps = {
        getHorizontalPadding: 0
    };

    render() {
        const {features, viewRegion, width, numRows, rowHeight, getHorizontalPadding, getAnnotationElement} = this.props;
        // Compute absolute intervals of all the features
        const navContext = viewRegion.getNavigationContext();
        const intervals = _.flatMap(features, feature => feature.computeNavContextCoordinates(navContext));

        // Arrange all the absolute intervals (rowAssignments)
        const drawModel = new LinearDrawingModel(viewRegion, width);
        const isPaddingConst = typeof getHorizontalPadding === "number";
        const paddingCallback = (interval => isPaddingConst ?
            getHorizontalPadding : getHorizontalPadding(interval.feature)
        );
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
