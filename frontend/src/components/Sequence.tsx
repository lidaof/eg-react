import React from 'react';
import OpenInterval from '../model/interval/OpenInterval';

const COMPLEMENT_BASE = {
    A: 'T',
    T: 'A',
    G: 'C',
    C: 'G'
};

function getReverseComplement(sequence: string): string {
    let result = '';
    for (let i = sequence.length - 1; i >= 0; i--) {
        const char = sequence.charAt(i);
        const complement = COMPLEMENT_BASE[ char.toUpperCase() ];
        result += complement || char; // Default to the unmodified char if there is no complement
    }
    return result;
}

const BASE_COLORS = {
    G: '#3899c7', // Blue
    C: '#e05144', // Red
    T: '#9238c7', // Purple
    A: '#89c738', // Green
    N: '#858585' // Grey
};
const UNKNOWN_BASE_COLOR = 'black';

interface SequenceProps {
    sequence: string;
    xSpan: OpenInterval;
    y?: number;
    isDrawBackground?: boolean;
    height?: number;
    letterSize?: number;
    isReverseComplement?: boolean;
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
        const {sequence, xSpan, y, isDrawBackground, height, letterSize, isReverseComplement} = this.props;
        if (!sequence) {
            return null;
        }

        const baseWidth = xSpan.getLength() / sequence.length;
        if (baseWidth < Sequence.MIN_X_WIDTH_PER_BASE) {
            return null;
        }

        const sequenceToDraw = isReverseComplement ? getReverseComplement(sequence) : sequence;

        const rects = [];
        if (isDrawBackground) {
            let x = xSpan.start;
            for (const base of sequenceToDraw) {
                rects.push(<rect
                    key={x}
                    x={x}
                    y={y}
                    width={baseWidth}
                    height={height}
                    style={{fill: BASE_COLORS[base.toUpperCase()] || UNKNOWN_BASE_COLOR}}
                />);
                x += baseWidth;
            }
        }

        const letters = [];
        if (baseWidth >= letterSize) {
            let x = xSpan.start;
            for (const base of sequenceToDraw) {
                letters.push(
                    <text
                        key={x}
                        x={x + baseWidth/2}
                        y={y + height/2 + 1}
                        dominantBaseline="middle"
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
