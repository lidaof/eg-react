import React from 'react';
import LinearDrawingModel from "../../model/LinearDrawingModel";
import { withTrackLegendWidth } from '../../components/withTrackLegendWidth';

class VerticalDividerNotConnected extends React.Component {
    render() {
        const { children, legendWidth, xOffset } = this.props;
        const {viewWindowRegion, viewWindow} = this.props.visData;
        const drawModel = new LinearDrawingModel(viewWindowRegion, viewWindow.getLength());
        let boxesAndLabels = [];
        let x = 0;
        for (const segment of viewWindowRegion.getFeatureSegments()) {
            const drawWidth = drawModel.basesToXWidth(segment.getLength());

            if (x > 0) { // Thick line at boundaries of each feature, except the first one
                boxesAndLabels.push(<div
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
        console.log(boxesAndLabels);
        return (
            <div style={{position: "relative", overflow: "hidden"}}>
                {children}
                {boxesAndLabels}
            </div>
            );
    }
}

export const VerticalDivider = withTrackLegendWidth(VerticalDividerNotConnected);