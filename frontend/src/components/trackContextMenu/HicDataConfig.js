import React from 'react';
import SelectConfig from './SelectConfig';
import { BinSize, NormalizationMode } from 'src/model/HicDataModes';

/**
 * A menu item for configuring bin sizes for hic tracks.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
export function BinSizeConfig(props) {
    return <SelectConfig
        {...props}
        optionName="binSize"
        label="Bin size:"
        defaultValue={BinSize.AUTO}
        choices={BinSize}
    />;
}

/**
 * Menu item for configuring normalization options for hic tracks.
 * 
 * @param {object} props - props as specified by React
 * @return {JSX.Element} normalization config to render
 */
export function HicNormalizationConfig(props) {
    return <SelectConfig
        optionName="normalization"
        label="Normalization"
        defaultValue={NormalizationMode.NONE}
        choices={NormalizationMode}
        {...props}
    />;
}
