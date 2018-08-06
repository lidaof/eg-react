import React from 'react';
import OpenInterval from '../model/interval/OpenInterval';

const BASE_COLORS = {
    g: '#3899c7', // Blue
    c: '#e05144', // Red
    t: '#9238c7', // Purple
    a: '#89c738', // Green
    n: '#858585' // Grey
};
const UNKNOWN_BASE_COLOR = 'black';

interface SequenceProps {
    sequence: string;
    xSpan: OpenInterval;
    y?: number;
    isDrawBackground?: boolean;
    height?: number;
    letterSize?: number;
}

/**
 * A set of SVG <text> elements representing a sequence, optionally backgrounded by <rect>s.
 * 
 * @author Silas Hsu
 */
export class Sequence extends React.PureComponent<SequenceProps> {
    static MIN_X_WIDTH_PER_BASE = 1;

    static defaultProps = {
        isDrawBackground: true,
        height: 15,
        letterSize: 12,
        y: 0
    };

    render() {
        const {sequence, xSpan, y, isDrawBackground, height, letterSize} = this.props;
        if (!sequence) {
            return null;
        }

        const baseWidth = xSpan.getLength() / sequence.length;
        if (baseWidth < Sequence.MIN_X_WIDTH_PER_BASE) {
            return null;
        }

        const rects = [];
        if (isDrawBackground) {
            let x = xSpan.start;
            for (const base of sequence) {
                rects.push(<rect
                    key={x}
                    x={x}
                    y={y}
                    width={baseWidth}
                    height={height}
                    style={{fill: BASE_COLORS[base.toLowerCase()] || UNKNOWN_BASE_COLOR}}
                />);
                x += baseWidth;
            }
        }

        const letters = [];
        if (baseWidth >= letterSize) {
            let x = xSpan.start;
            for (const base of sequence) {
                letters.push(
                    <text
                        key={x}
                        x={x + baseWidth/2}
                        y={y + height/2 + 1}
                        alignmentBaseline="middle"
                        style={{textAnchor: "middle", fill: 'white', fontSize: letterSize}}
                    >
                        {base}
                    </text>
                );
                x += baseWidth;
            }
        }

        return <React.Fragment>{rects}{letters}</React.Fragment>;
    }
}
