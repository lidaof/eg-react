import React from 'react';
import {EyeIcon, EyeClosedIcon} from '@primer/octicons-react';

export const ModelListMenu = (props) => {
    const {modelDisplay, onToggleModelDisplay} = props;
    if(!modelDisplay) return null;
    return (
        <div style={{padding: 5}}>
             <label>
          Models:
        </label>
        {Object.entries(modelDisplay).map((modelValue, index) => {
          return <div className="toggle-model-container" key={index}><span>{modelValue[0]}</span> <span className="toggle-model" onClick={() => onToggleModelDisplay(modelValue[0]) }>{modelValue[1] ? <EyeIcon size={24} /> : <EyeClosedIcon size={24} />}</span></div>
        })}
        </div>
    );
}

ModelListMenu.defaultProps = {
    modelDisplay: null,
    onToggleModelDisplay: () => {},
}