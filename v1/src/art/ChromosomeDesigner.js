import React from 'react'
import LinearDrawingModel from '../model/LinearDrawingModel';

const HEIGHT = 20;
const BOUNDARY_LINE_EXTENT = 5;
const DEFAULT_LABEL_OFFSET = 100;

class ChromosomeDesigner extends React.Component {
    constructor(viewRegion, width, labelOffset=DEFAULT_LABEL_OFFSET) {
        super();
        this._viewRegion = viewRegion;
        this._drawModel = new LinearDrawingModel(viewRegion, width);
        this._labelOffset = labelOffset;
    }
    
    design() {
        let children = [];

        const intervals = this._viewRegion.getFeatureIntervals();
        let x = 0;
        for (let interval of intervals) {
            let width = this._drawModel.basesToXWidth(interval.getLength());
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
                y={this._labelOffset}
                style={{textAnchor: "middle", fontWeight: "bold"}}
            >
                {interval.getName()}
            </text>);

            x += width;
        }

        return children;
    }
}

export default ChromosomeDesigner;
