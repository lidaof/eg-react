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
        const complement = COMPLEMENT_BASE[char.toUpperCase()];
        result += complement || char; // Default to the unmodified char if there is no complement
    }
    return result;
}

export const BASE_COLORS = {
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
    minXwidthPerBase?: number;
    drawHeights?: any;
    zeroLine?: number;
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
        y: 0,
        minXwidthPerBase: 1,
    };

    render() {
        const { sequence, xSpan, y, isDrawBackground, height, letterSize, isReverseComplement, minXwidthPerBase, drawHeights, zeroLine } = this.props;
        if (!sequence) {
            return null;
        }

        const baseWidth = xSpan.getLength() / sequence.length;
        if (baseWidth < minXwidthPerBase) {
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
                    style={{ fill: BASE_COLORS[base.toUpperCase()] || UNKNOWN_BASE_COLOR }}
                />);
                x += baseWidth;
            }
        }

        const letters = [];
        const seqmode = !!drawHeights && drawHeights.length > 0;
        if (baseWidth >= letterSize) {
            let x = xSpan.start;
            for (const base of sequenceToDraw) {
                const x_mid = x + baseWidth * 0.5;
                if (seqmode) {
                    // this scale factor somehow miraculously works
                    // don't exactly know the height size fontsize = 1.4*baseWidth
                    const scale_fac = drawHeights[Math.floor(x_mid)] / baseWidth;
                    letters.push(
                        <text
                            key={x}
                            x={x_mid}
                            y={zeroLine}
                            dominantBaseline="auto"
                            transform={`translate(${x_mid} ${zeroLine}) scale(1 ${scale_fac}) translate(-${x_mid} -${zeroLine})`}
                            style={{
                                textAnchor: "middle", fill: BASE_COLORS[base.toUpperCase()],
                                fontSize: 1.4 * baseWidth,
                            }}
                        >
                            {base.toUpperCase()}
                        </text>
                    );
                }
                else {
                    letters.push(
                        <text
                            key={x}
                            x={x_mid}
                            y={y + height / 2 + 1}
                            dominantBaseline="middle"
                            style={{ textAnchor: "middle", fill: 'white', fontSize: letterSize }}
                        >
                            {base}
                        </text>
                    );
                }
                x += baseWidth;
            }
        }



        return <React.Fragment>{rects}{letters}</React.Fragment>;
    }
}
