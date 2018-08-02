import React, { SVGProps } from 'react';

interface TranslatableGProps extends SVGProps<SVGGElement> {
    x?: number; // x translation to apply to children
    y?: number; // y translation to apply to children
    innerRef?(element: SVGGElement): void; // ref to the <g> element
}

/**
 * Ever wish <g> elements accepted `x` and `y` attributes?  This one does!
 * 
 * @param {TranslatableGProps} props - props as specified by React
 * @return {JSX.Element} - <g> element
 * @author Silas Hsu
 */
export function TranslatableG(props: TranslatableGProps) {
    const {x, y, innerRef, ...remainingProps} = props;
    const transform = x || y ? `translate(${x || 0} ${y || 0})` : undefined;
    return <g ref={innerRef} transform={transform} {...remainingProps} />;
}
