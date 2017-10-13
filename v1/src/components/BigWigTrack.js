import BarChart from './BarChart';
import BigWigDataSource from '../dataSources/BigWigDataSource';
import React from 'react';
import SvgContainer from './SvgContainer';
import Track from './Track';

const DEFAULT_HEIGHT = 50;

/**
 * Track that displays BigWig data.
 * 
 * @author Silas Hsu
 */
class BigWigTrack extends Track {
    static TYPE_NAME = "bigwig";

    makeDefaultDataSource() {
        return new BigWigDataSource(this.props.metadata.url);
    }

    render() {
        const height = this.props.metadata.options.height || DEFAULT_HEIGHT;
        let data = this.state.data || [];
        let svgStyle = {
            borderTop: "1px solid black",
            borderBottom: "1px solid black",
            overflow: "hidden",
            height: `${height}px`,
        }
        if (this.state.isLoading) {
            //svgStyle.opacity = 0.5;
        }
        if (this.state.error) {
            svgStyle.backgroundColor = "red";
        }
        return (
        <div style={{paddingLeft: "20px", paddingRight: "20px"}}>
            {this.state.isLoading ? <div style={{opacity: 0.75, position: "absolute", textAlign: "center", width: "100%", height: `${height}px`, backgroundColor: "white"}}><h2>Loading...</h2></div> : null}
            <SvgContainer model={this.props.viewRegion} svgStyle={svgStyle} viewBoxX={this.state.xOffset} >
                <BarChart data={data} height={height} />
            </SvgContainer>
        </div>
        );
    }
}

export default BigWigTrack;
