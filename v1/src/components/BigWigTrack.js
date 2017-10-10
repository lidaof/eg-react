import BarChart from './BarChart';
import React from 'react';
import SvgContainer from './SvgContainer';
import Track from './Track';
import { LEFT_MOUSE } from './DomDragListener';
import ViewDragListener from './ViewDragListener';

class BigWigTrack extends Track {
    static TYPE_NAME = "bigwig";

    render() {
        let data = this.state.data || [];
        let svgStyle = {
            border: "1px solid black",
            height: "50px",
        }
        if (this.state.isLoading) {
            svgStyle.opacity = 0.5;
        }

        return (
        <div style={{padding: "20px"}}>
            <SvgContainer model={this.props.viewRegion} svgStyle={svgStyle} viewBoxX={this.state.xOffset}>
                <BarChart data={data} />
                <ViewDragListener
                    button={LEFT_MOUSE}
                    onViewDrag={this.viewDrag}
                    onViewDragEnd={this.viewDragEnd}
                />
            </SvgContainer>
        </div>
        );
    }
}

export default BigWigTrack;
