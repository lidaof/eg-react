import React from 'react';
import PropTypes from 'prop-types';

import TranslatableG from '../../TranslatableG';
import AnnotationArrows from '../commonComponents/AnnotationArrows';
import BackgroundedText from '../commonComponents/BackgroundedText';

import Feature from '../../../model/Feature';
import LinearDrawingModel from '../../../model/LinearDrawingModel';
import OpenInterval from '../../../model/interval/OpenInterval';
import { getContrastingColor } from '../../../util';

const HEIGHT = 9;

/**
 * Visualizer for Feature objects.
 * 
 * @author Silas Hsu
 */
class BedAnnotation extends React.Component {
    static HEIGHT = HEIGHT;

    static propTypes = {
        feature: PropTypes.instanceOf(Feature).isRequired, // Feature to visualize
        drawModel: PropTypes.instanceOf(LinearDrawingModel).isRequired, // Drawing model
        absLocation: PropTypes.instanceOf(OpenInterval).isRequired, // Location of the feature in navigation context
        y: PropTypes.number, // Y offset
        color: PropTypes.string, // Primary color to draw
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
        const {feature, drawModel, absLocation, y, color, onClick} = this.props;
        const x = drawModel.baseToX(absLocation.start);
        const width = drawModel.basesToXWidth(absLocation.getLength());

        const mainBody = <rect x={x} y={0} width={width} height={HEIGHT} fill={color} />;

        let arrows = null;
        if (feature.getIsForwardStrand() || feature.getIsReverseStrand()) {
            arrows = <AnnotationArrows
                startX={x}
                endX={x + width}
                height={HEIGHT}
                isToRight={feature.getIsForwardStrand()}
                color="white"
            />;
        }

        let label = null;
        const estimatedLabelWidth = feature.getName().length * HEIGHT;
        if (estimatedLabelWidth < 0.5 * width) {
            const centerX = x + 0.5 * width;
            label = (
                <BackgroundedText
                    x={centerX}
                    y={0}
                    height={HEIGHT - 1}
                    fill={getContrastingColor(color)}
                    alignmentBaseline="hanging"
                    textAnchor="middle"
                    backgroundColor={color}
                    backgroundOpacity={1}
                >
                    {feature.getName()}
                </BackgroundedText>
            );
        }

        return (
        <TranslatableG y={y} onClick={event => onClick(event, feature)} >
            {mainBody}
            {arrows}
            {label}
        </TranslatableG>
        );
    }
}

export default BedAnnotation;
