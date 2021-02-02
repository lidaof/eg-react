import React from 'react';
import SliderConfig from './SliderConfig';
/**
 * A context menu item that configures track opacity.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
function OpacitySliderConfig(props) {
    return <SliderConfig 
                {...props} 
                optionName="opacity"
                label="Opacity:"
                mode={1}
                step={1}
                domain={[0, 100]}
                values={ props.optionsObjects[0].opacity }
                onUpdate={ () => {} } // Do nothing when updating
            />
}

export default OpacitySliderConfig;
