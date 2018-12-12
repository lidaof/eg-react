import React from 'react';
import SelectConfig from './SelectConfig';
import { BinSizes } from '../../model/BinSizes';

/**
 * A menu item for configuring bin sizes for interaction tracks.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
export function BinSizeConfig(props) {
    return <SelectConfig
        {...props}
        optionName="binSize"
        label="Bin size:"
        defaultValue={BinSizes.AUTO}
        choices={BinSizes}
    />;
}
