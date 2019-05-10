import React, { Component } from 'react';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import ReactToPrint from 'react-to-print';
class HeatmapWidget extends Component {


    render() { 
        const { data, keys } = this.props.data;
        const tickValues = calcTickValues(keys);
    return ( 
        <div>
            <div style={{ float: 'right'}}>
                <ReactToPrint
                    trigger={() => <button className="btn btn-secondary btn-sm">Export plot</button>}
                    content={() => this.componentRef}
                />
            </div>
            
            <div style={{ width: '900px', height: '500px' }} ref={el => (this.componentRef = el)}>
            <ResponsiveHeatMap 
                width={900}
                height={500}
                margin={{
                    top: 60,
                    right: 80,
                    bottom: 60,
                    left: 180
                }}
                data={data}
                keys={keys}
                indexBy="row"
                colors="RdBu"
                enableLabels={false} // not working
                labelTextColor="rgba(0,0,0,0)"
                axisTop={{
                    "orient": "top",
                    "tickSize": 5,
                    "tickPadding": 5,
                    "tickRotation": -90,
                    "legend": "",
                    "tickValues": tickValues,
                    "legendOffset": 36
                }}
                animate={true}    
                pixelRatio={2}
                minValue="auto"
                maxValue="auto"
                forceSquare={false}
                sizeVariation={0}
                padding={0}   
                hoverTarget="cell"
                // cellHoverOthersOpacity={0.25} 
            />
            </div>
        </div>
         );
    }
}

export default HeatmapWidget;


function calcTickValues(keys) {
    const spacedOutKeys = [];
    keys.forEach((d, i) => {
        if ((i + 1) % 10 === 0) {
            spacedOutKeys.push(d);
        }
    })
    return spacedOutKeys;
}

