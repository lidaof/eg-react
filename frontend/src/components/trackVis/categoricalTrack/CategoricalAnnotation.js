import React from 'react';
import PropTypes from 'prop-types';

import { TranslatableG } from '../../TranslatableG';
import BackgroundedText from '../commonComponents/BackgroundedText';

import Feature from '../../../model/Feature';
import OpenInterval from '../../../model/interval/OpenInterval';
import { getContrastingColor } from '../../../util';

const TEXT_HEIGHT = 9;

/**
 * Visualizer for Feature objects.
 * 
 * @author Silas Hsu
 */
class CategoricalAnnotation extends React.Component {
    static TEXT_HEIGHT = TEXT_HEIGHT;

    static propTypes = {
        feature: PropTypes.instanceOf(Feature).isRequired, // Feature to visualize
        xSpan: PropTypes.instanceOf(OpenInterval).isRequired, // x span the annotation will occupy
        y: PropTypes.number, // Y offset
        color: PropTypes.string, // Primary color to draw
        isMinimal: PropTypes.bool, // Whether to just render a plain box
        /**
         * Callback for click events.  Signature: (event: MouseEvent, feature: Feature): void
         *     `event`: the triggering click event
         *     `feature`: the same Feature as the one passed via props
         */
        onClick: PropTypes.func,
    };

    static defaultProps = {
        color: "blue",
        onClick: (event, feature) => undefined,
    };

    render() {
        const {feature, xSpan, y, color, isMinimal, onClick, height, category} = this.props;
        const contrastColor = getContrastingColor(color);
        const [startX, endX] = xSpan;
        const width = endX - startX;
        if (width <= 0) {
            return null;
        }

        const mainBody = <rect x={startX} y={0} width={width} height={height} fill={color} />;
        if (isMinimal) {
            return <TranslatableG y={y} onClick={event => onClick(event, feature)} >{mainBody}</TranslatableG>;
        }

        
        let label = null;
        const labelText = category[feature.getName()].name;
        const estimatedLabelWidth = labelText.length * TEXT_HEIGHT;
        if (estimatedLabelWidth < 0.9 * width) {
            const centerX = startX + 0.5 * width;
            const centerY = (height - TEXT_HEIGHT + 1) * 0.5;
            label = (
                <BackgroundedText
                    x={centerX}
                    y={centerY}
                    height={TEXT_HEIGHT - 1}
                    fill={contrastColor}
                    alignmentBaseline="hanging"
                    textAnchor="middle"
                    backgroundColor={color}
                    backgroundOpacity={1}
                >
                    {labelText}
                </BackgroundedText>
            );
        }

        return (
        <TranslatableG y={y} onClick={event => onClick(event, feature)} >
            {mainBody}
            {label}
        </TranslatableG>
        );
    }
}

export default CategoricalAnnotation;
