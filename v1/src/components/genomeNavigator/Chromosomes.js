import React from 'react';
import PropTypes from 'prop-types';

import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import LinearDrawingModel from '../../model/LinearDrawingModel';
import CytoBand from '../../model/CytoBand';
import axios from 'axios';

const HEIGHT = 20;
const BOUNDARY_LINE_EXTENT = 5;
const DEFAULT_LABEL_OFFSET = 100;

/**
 * Draws rectangles that represent features in a navigation context, and labels for the features.  Called "Chromosomes"
 * for legacy reasons.
 * 
 * @author Silas Hsu
 */
class Chromosomes extends React.PureComponent {
    static propTypes = {
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // Region to visualize
        width: PropTypes.number.isRequired, // The drawing model to use
        labelOffset: PropTypes.number,
        x: PropTypes.number,
        y: PropTypes.number
    };
    
    constructor(props){
        super(props);
        this.state = {
            cytoBandData: {}
        }
    }

    componentDidMount(){
        const intervals = this.props.viewRegion.getFeatureIntervals();
        for (let interval of intervals) {
            axios.get(`/hg19/cytoBand/${interval.getName()}`).then((response) => {
                let tmp = {...this.state.cytoBandData};
                tmp[interval.getName()] = response.data
                this.setState({cytoBandData: tmp})
            });
        }          
    }
    /**
     * Clears this group and redraws all the feature boxes
     * 
     * @override
     */
    render() {
        let children = [];
        const drawModel = new LinearDrawingModel(this.props.viewRegion, this.props.width);

        const intervals = this.props.viewRegion.getFeatureIntervals();
        let x = 0, y = 0; //add y to avoid dup key warnings
        for (let interval of intervals) {
            let intervalWidth = drawModel.basesToXWidth(interval.getLength());
            // Box for region
            children.push(<rect
                key={"rect" + y}
                x={x}
                y={BOUNDARY_LINE_EXTENT}
                width={intervalWidth}
                height={HEIGHT}
                style={{stroke: "#000", strokeWidth: 2, fill: "#fff"}}
                opacity="0.5"
            />);

            if (x > 0) { // Thick line at boundaries of each feature (except the first one)
                children.push(<line
                    key={"line" + y}
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
                x={x + intervalWidth/2}
                y={this.props.labelOffset || DEFAULT_LABEL_OFFSET}
                style={{textAnchor: "middle", fontWeight: "bold"}}
            >
                {interval.getName()}
            </text>);

            x += intervalWidth;
            y += 1;

            children = [...children, ...new CytoBand(this.props.viewRegion, drawModel, x, BOUNDARY_LINE_EXTENT, HEIGHT, this.state.cytoBandData[interval.getName()])];
        }

        return <svg x={this.props.x} y={this.props.y}>{children}</svg>;
    }
}

export default Chromosomes;
