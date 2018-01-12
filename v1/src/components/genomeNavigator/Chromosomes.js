import React from 'react';
import PropTypes from 'prop-types';

import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import LinearDrawingModel from '../../model/LinearDrawingModel';

const HEIGHT = 20;
const BOUNDARY_LINE_EXTENT = 5;
const LABEL_OFFSET = 100;

/**
 * Draws rectangles that represent features in a navigation context, and labels for the features.  Called "Chromosomes"
 * for legacy reasons.
 * 
 * @author Silas Hsu
 */
class Chromosomes extends React.Component {
    static propTypes = {
        displayedRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // Region to visualize
        drawModel: PropTypes.instanceOf(LinearDrawingModel), // The drawing model to use
        x: PropTypes.number,
        y: PropTypes.number
    };

    /**
     * Clears this group and redraws all the feature boxes
     * 
     * @override
     */
    render() {
        let children = [];

        const intervals = this.props.displayedRegion.getFeatureIntervals();
        let x = 0;
        for (let interval of intervals) {
            let width = this.props.drawModel.basesToXWidth(interval.getLength());
            // Box for region
            children.push(<rect
                key={"rect" + x}
                x={x}
                y={BOUNDARY_LINE_EXTENT}
                width={width}
                height={HEIGHT}
                style={{stroke: "#000", strokeWidth: 2, fill: "#fff"}}
            />);

            if (x > 0) { // Thick line at boundaries of each feature (except the first one)
                children.push(<line
                    key={"line" + x}
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={BOUNDARY_LINE_EXTENT * 2 + HEIGHT}
                    stroke={"#000"}
                    strokeWidth={4}
                />);
            }
            // Label for region
            children.push(<text
                key={"text" + x}
                x={x + width/2}
                y={LABEL_OFFSET}
                style={{textAnchor: "middle", fontWeight: "bold"}}
            >
                {interval.getName()}
            </text>);

            x += width;
        }

        return <svg x={this.props.x} y={this.props.y}>{children}</svg>;
    }
}

export default Chromosomes;
