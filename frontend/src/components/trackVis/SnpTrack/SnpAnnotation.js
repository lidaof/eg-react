import React from 'react';
import PropTypes from 'prop-types';

import { TranslatableG } from '../../TranslatableG';
import AnnotationArrows from '../commonComponents/annotation/AnnotationArrows';
import BackgroundedText from '../commonComponents/BackgroundedText';

import Snp from '../../../model/Snp';
import OpenInterval from '../../../model/interval/OpenInterval';
import { getContrastingColor } from '../../../util';

const HEIGHT = 9;

/**
 * Visualizer for Snp objects.
 * 
 * @author Silas Hsu
 */
class SnpAnnotation extends React.Component {
    static HEIGHT = HEIGHT;

    static propTypes = {
        snp: PropTypes.instanceOf(Snp).isRequired, // Snp to visualize
        xSpan: PropTypes.instanceOf(OpenInterval).isRequired, // x span the annotation will occupy
        y: PropTypes.number, // Y offset
        color: PropTypes.string, // Primary color to draw
        reverseStrandColor: PropTypes.string, // Color of reverse strand annotations
        isMinimal: PropTypes.bool, // Whether to just render a plain box
        isInvertArrowDirection: PropTypes.bool, // Whether to reverse any arrow directions
        /**
         * Callback for click events.  Signature: (event: MouseEvent, snp: Snp): void
         *     `event`: the triggering click event
         *     `snp`: the same Snp as the one passed via props
         */
        onClick: PropTypes.func,
    };

    static defaultProps = {
        color: "green",
        reverseStrandColor: "pink",
        isInvertArrowDirection: false,
        onClick: (event, snp) => undefined,
    };

    render() {
        const {snp, xSpan, y, color, reverseStrandColor, isMinimal, isInvertArrowDirection, onClick} = this.props;
        const colorToUse = snp.getIsReverseStrand() ? reverseStrandColor : color;
        const contrastColor = getContrastingColor(colorToUse);
        const [startX, endX] = xSpan;
        const width = endX - startX;
        if (width <= 0) {
            return null;
        }

        const mainBody = <rect x={startX} y={0} width={width} height={HEIGHT} fill={colorToUse} />;
        if (isMinimal) {
            return <TranslatableG y={y} onClick={event => onClick(event, snp)} >{mainBody}</TranslatableG>;
        }

        let arrows = null;
        if (snp.getHasStrand()) {
            arrows = <AnnotationArrows
                startX={startX}
                endX={endX}
                height={HEIGHT}
                // If this boolean expression confuses you, construct a truth table.  I needed one ;)
                isToRight={snp.getIsReverseStrand() === isInvertArrowDirection}
                color={contrastColor}
            />;
        }

        let label = null;
        const estimatedLabelWidth = snp.getName().length * HEIGHT;
        if (estimatedLabelWidth < 0.5 * width) {
            const centerX = startX + 0.5 * width;
            label = (
                <BackgroundedText
                    x={centerX}
                    y={0}
                    height={HEIGHT - 1}
                    fill={contrastColor}
                    dominantBaseline="hanging"
                    textAnchor="middle"
                    backgroundColor={colorToUse}
                    backgroundOpacity={1}
                >
                    {snp.getName()}
                </BackgroundedText>
            );
        }

        return (
        <TranslatableG y={y} onClick={event => onClick(event, snp)} >
            {mainBody}
            {arrows}
            {label}
        </TranslatableG>
        );
    }
}

export default SnpAnnotation;
