import React from 'react';

export const HoverInfo = ({atom, resolution}) => {
    if(!atom) return null;
    return (
        <div style={{padding: 5}}>
            <div>{atom.chain} {atom.properties.start}</div>
            <div>Resolution: {resolution}</div>
            <div>{atom.properties.hap}</div>
        </div>
    );
}

HoverInfo.defaultProps = {
    atom: null,
}