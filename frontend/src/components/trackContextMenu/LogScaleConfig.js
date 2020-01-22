import React from 'react';
import SelectConfig from './SelectConfig';
import { LogChoices } from '../../model/LogChoices';
/**
 * A context menu item that configures track log-scaling on the y-axis.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
function LogScaleConfig(props) {
    return <SelectConfig 
                {...props} 
                optionName="logScale" 
                label="Logarithm:" 
                choices={{
                    None: LogChoices.AUTO,
                    log10: LogChoices.BASE10,
                    // log2: LogChoices.BASE2,
                    // ln: LogChoices.NATURAL,
                }}
                defaultValue={LogChoices.AUTO}
            />
}

export default LogScaleConfig;
