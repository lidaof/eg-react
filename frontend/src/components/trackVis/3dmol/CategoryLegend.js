import React from 'react';
import {ColorPicker} from './ColorPicker';

export const CategoryLegend = (props) => {
    const {categories, onUpdateLegendColor} = props;
    // console.log(props)
    if(!categories) return null;
    return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <div>
                <ColorPicker onUpdateLegendColor={onUpdateLegendColor} colorKey="compAcolor" label="A" initColor={categories.A} />
            </div>
            <div>
                <ColorPicker onUpdateLegendColor={onUpdateLegendColor} colorKey="compBcolor" label="B" initColor={categories.B}/>
            </div>
        </div>
    );
}

CategoryLegend.defaultProps = {
    categories: null,
}