import React from 'react';

/**
 * Ever wish <g> elements accepted `x` and `y` attributes?  This one does!
 * 
 * Props:
 *   - `x`: {number} x translation to apply to children
 *   - `y`: {number} y translation to apply to children
 *   - `innerRef`: {function} ref to the <g> element
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} - <g> element
 * @author Silas Hsu
 */
function TranslatableG(props) {
    const {x, y, innerRef, ...remainingProps} = props;
    const transform = x || y ? `translate(${x || 0} ${y || 0})` : undefined;
    return <g ref={innerRef} transform={transform} {...remainingProps} />;
}

export default TranslatableG;
