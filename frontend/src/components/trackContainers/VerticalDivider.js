import React from 'react';
import LinearDrawingModel from "../../model/LinearDrawingModel";
import { withTrackLegendWidth } from '../../components/withTrackLegendWidth';

/**
 * a component to draw a light gray line between chromosome or feature (only in region sets) boundary
 * @author Daofeng Li
 */

class VerticalDividerNotConnected extends React.Component {
    render() {
        const { children, legendWidth, xOffset, genomeRegion } = this.props;
        const {viewWindowRegion, viewWindow} = this.props.visData;
        const drawModel = new LinearDrawingModel(viewWindowRegion, viewWindow.getLength());
        let verticalLines = [];
        let x = 0;
        for (const segment of genomeRegion.getFeatureSegments()) {
            const drawWidth = drawModel.basesToXWidth(segment.getLength());
            if (x > 0) { // Thick line at boundaries of each feature, except the first one
                verticalLines.push(<div key={"divider"+x}
                style={{
                    borderRight: "1px solid lightgray",
                    position: "absolute",
                    top: 0,
                    left: x + xOffset + legendWidth + "px",
                    height: "100%",
                }}
                ></div>
                );
            }
            x += drawWidth;
        }
        return (
            <div style={{position: "relative", overflow: "hidden"}}>
                {children}
                {verticalLines}
            </div>
            );
    }
}

export const VerticalDivider = withTrackLegendWidth(VerticalDividerNotConnected);