import React from 'react';
import SelectConfig from './SelectConfig';
import { G3dResolution, RegionMode } from '../../model/G3dDataModes';

/**
 * A menu item for configuring bin sizes for hic tracks.
 *
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
export function G3dResolutionConfig(props) {
    return (
        <SelectConfig
            {...props}
            optionName="resolution"
            label="Resolution:"
            defaultValue={G3dResolution.AUTO}
            choices={G3dResolution}
        />
    );
}

/**
 * Menu item for configuring normalization options for hic tracks.
 *
 * @param {object} props - props as specified by React
 * @return {JSX.Element} normalization config to render
 */
export function G3dRegionConfig(props) {
    return (
        <SelectConfig
            optionName="region"
            label="Data region"
            defaultValue={RegionMode.REGION}
            choices={RegionMode}
            {...props}
        />
    );
}
