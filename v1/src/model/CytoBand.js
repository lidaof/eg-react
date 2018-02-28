import React from 'react';
import ChromosomeInterval from './interval/ChromosomeInterval';

// const centromereColor = "rgb(141,64,52)";

const cytoBandColor = {
    'gneg': {bandColor: "rgb(255,255,255)", textColor: "rgb(0,0,0)"},
    'gpos25': {bandColor: "rgb(180,180,180)", textColor: "rgb(0,0,0)"},
    'gpos50': {bandColor: "rgb(120,120,120)", textColor: "rgb(255,255,255)"},
    'gpos75': {bandColor: "rgb(60,60,60)", textColor: "rgb(255,255,255)"},
    'gpos100': {bandColor: "rgb(0,0,0)", textColor: "rgb(255,255,255)"},
    'gvar': {bandColor: "rgb(0,0,0)", textColor: "rgb(255,255,255)"},
    'stalk': {bandColor: "rgb(180,180,180)", textColor: "rgb(0,0,0)"},
    'gpos33': {bandColor: "rgb(142,142,142)", textColor: "rgb(255,255,255)"},
    'gpos66': {bandColor: "rgb(57,57,57)", textColor: "rgb(255,255,255)"},
    'acen': {bandColor: "rgb(180,180,180)", textColor: "rgb(0,0,0)"},
};


class CytoBand{
    
    constructor(viewRegion, drawModel, x, y, height, data){
        let children = [];
        data && data.map((entry) => {
            let chrInterval = new ChromosomeInterval(entry.chrom, entry.chromStart, entry.chromEnd);
            let baseX = viewRegion._navContext.convertFeatureCoordinateToBase(entry.chrom, entry.chromStart);
            let drawX = drawModel.baseToX(baseX);
            let intervalWidth = drawModel.basesToXWidth(chrInterval.getLength());
            //rect for cytoband
            children.push(<rect
                key={entry._id}
                x={drawX}
                y={y}
                width={intervalWidth}
                height={height}
                style={{stroke: cytoBandColor[entry.gieStain].bandColor, strokeWidth: 1, fill: cytoBandColor[entry.gieStain].bandColor}}
            />);
            // Label for cytoband
            //let nameSvg = <text>{entry.name}</text>;
            //let nameWidth = nameSvg.getBBox().width;
            //let nameWidth = nameSvg.getComputedTextLength();
            let nameWidth=8;
            if (intervalWidth > nameWidth){
                children.push(<text
                key={"text" + entry._id}
                x={drawX + intervalWidth/2}
                y={y + height/2 + 5 }
                style={{textAnchor: "middle", fill: cytoBandColor[entry.gieStain].textColor}}
                >
                {entry.name}
                </text>);
            }
        });
        return children;
    }
}

export default CytoBand;