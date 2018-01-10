import React from 'react';
import PropTypes from 'prop-types';
import SVG from 'svg.js';

import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import LinearDrawingModel from '../../model/LinearDrawingModel';
import withSvgJs from '../withSvgJs';

const HEIGHT = 20;
const BOUNDARY_LINE_EXTENT = 5;
const LABEL_OFFSET = 80;

/**
 * Draws rectangles that represent features in a navigation context, and labels for the features.  Called "Chromosomes"
 * for legacy reasons.
 * 
 * @author Silas Hsu
 */
class Chromosomes extends React.Component {
    static propTypes = {
        group: PropTypes.instanceOf(SVG.Element).isRequired, // An object from SVG.js to draw in
        displayedRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // Region to visualize
        drawModel: PropTypes.instanceOf(LinearDrawingModel).isRequired, // The drawing model to use
    };

    /**
     * Clears this group and redraws all the feature boxes
     * 
     * @override
     */
    render() {
        this.props.group.clear();

        const intervals = this.props.displayedRegion.getFeatureIntervals();
        let x = 0;
        for (let interval of intervals) {
            let width = this.props.drawModel.basesToXWidth(interval.getLength());

            this.props.group.rect(width, HEIGHT).attr({ // Rectangle for each feature
                x: x,
                y: BOUNDARY_LINE_EXTENT,
                stroke: "#000",
                "stroke-width": 2,
                fill: "#fff"
            });

            if (x > 0) { // Thick line at boundaries of each feature (except the first one)
                let regionBoundaryLine = this.props.group.line(x, 0, x, BOUNDARY_LINE_EXTENT * 2 + HEIGHT);
                regionBoundaryLine.stroke({width: 4, color: '#000'});
            }

            this.props.group.text(interval.getName()).attr({ // Feature labels
                x: x + width/2,
                y: LABEL_OFFSET,
                "text-anchor": "middle",
                "font-weight": "bold"
            });

            x += width;
        }
        return null;
    }
}

export default withSvgJs(Chromosomes);
