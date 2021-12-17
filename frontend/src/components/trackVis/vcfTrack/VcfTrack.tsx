import React from "react";
import memoizeOne from "memoize-one";
import { scaleLinear } from "d3-scale";
import _ from "lodash";
import VcfAnnotation from "./VcfAnnotation";
import { PropsFromTrackContainer } from "../commonComponents/Track";
import { AnnotationTrack } from "../commonComponents/annotation/AnnotationTrack";
import VcfDetail from "./VcfDetail";
import Tooltip from "../commonComponents/tooltip/Tooltip";
import { withTooltip, TooltipCallbacks } from "../commonComponents/tooltip/withTooltip";
import { PlacedFeatureGroup } from "../../../model/FeatureArranger";
import OpenInterval from "model/interval/OpenInterval";
import NumericalTrack from "../commonComponents/numerical/NumericalTrack";
import { NumericalDisplayModes, VcfColorScaleKeys, VcfDisplayModes } from "model/DisplayModes";
import { DefaultAggregators } from "model/FeatureAggregator";
import DisplayedRegionModel from "model/DisplayedRegionModel";
import Vcf from "model/Vcf";

const ROW_VERTICAL_PADDING = 2;

export const DEFAULT_OPTIONS = {
    highValueColor: "blue",
    lowValueColor: "red",
    maxRows: 10,
    rowHeight: 20,
    hiddenPixels: 0,
    colorScaleKey: VcfColorScaleKeys.AF,
    displayMode: VcfDisplayModes.AUTO,
    ensemblStyle: false,
};

interface VcfTrackProps extends PropsFromTrackContainer, TooltipCallbacks {
    data: Vcf[];
    viewRegion: DisplayedRegionModel;
    viewWindow: OpenInterval;
    width: number;
    options: {
        highValueColor?: any;
        lowValueColor?: any;
        maxRows?: number;
        rowHeight?: number;
        alwaysDrawLabel?: boolean;
        hiddenPixels?: number;
        colorScaleKey?: string;
        displayMode?: string;
    };
}

/**
 * Track component for VCF annotations.
 *
 * @author Daofeng Li
 */
class VcfTrackNoTooltip extends React.Component<VcfTrackProps> {
    static displayName = "VcfTrack";
    scales: any;
    constructor(props: VcfTrackProps) {
        super(props);
        this.scales = null;
        this.renderTooltip = this.renderTooltip.bind(this);
        this.renderAnnotation = this.renderAnnotation.bind(this);
        this.computeColorScales = memoizeOne(this.computeColorScales);
    }

    computeColorScales = (data: Vcf[], colorKey: string, lowValueColor: any, highValueColor: any) => {
        let values: any[];
        if (colorKey === VcfColorScaleKeys.QUAL) {
            values = data.map(v => v.variant.QUAL)
        } else if (colorKey === VcfColorScaleKeys.AF) {
            values = data.map(v => {
                if (v.variant.INFO.hasOwnProperty('AF')) {
                    return v.variant.INFO.AF[0]
                }
                return 0;
            })
        } else {
            values = []
        }
        const colorScale = scaleLinear()
            .domain([0, _.max(values)])
            .range([lowValueColor, highValueColor])
            .clamp(true);
        return colorScale;
    }

    /**
     * Renders the tooltip for a feature.
     *
     * @param {React.MouseEvent} event - mouse event that triggered the tooltip request
     * @param {Vcf} vcf - vcf for which to display details
     */
    renderTooltip(event: React.MouseEvent, vcf: Vcf) {
        const tooltip = (
            <Tooltip pageX={event.pageX} pageY={event.pageY} onClose={this.props.onHideTooltip}>
                <VcfDetail vcf={vcf} />
            </Tooltip>
        );
        this.props.onShowTooltip(tooltip);
    }

    paddingFunc = (vcf: Vcf, xSpan: OpenInterval) => {
        const width = xSpan.end - xSpan.start;
        const estimatedLabelWidth = vcf.getName().length * 9;
        if (estimatedLabelWidth < 0.5 * width) {
            return 5;
        } else {
            return 9 + estimatedLabelWidth;
        }
    };

    /**
     * Renders one annotation.
     *
     * @param {PlacedFeature} - feature and drawing info
     * @param {number} y - y coordinate to render the annotation
     * @param {boolean} isLastRow - whether the annotation is assigned to the last configured row
     * @param {number} index - iteration index
     * @return {JSX.Element} element visualizing the feature
     */
    renderAnnotation(placedGroup: PlacedFeatureGroup, y: number, isLastRow: boolean, index: number) {
        return placedGroup.placedFeatures.map((placement, i) => (
            <VcfAnnotation
                key={i}
                feature={placement.feature}
                xSpan={placement.xSpan}
                y={y}
                isMinimal={isLastRow}
                height={this.props.options.rowHeight}
                colorScale={this.scales}
                onClick={this.renderTooltip}
                alwaysDrawLabel={this.props.options.alwaysDrawLabel}
            />
        ));
    }

    render() {
        const { data, viewRegion, viewWindow, width, options } = this.props;
        const currentViewLength = viewRegion.getWidth() * viewWindow.getLength() / width;
        const numericalOptions = {
            ...this.props.options,
            displayMode: NumericalDisplayModes.AUTO,
            aggregateMethod: DefaultAggregators.types.COUNT,
        };
        if (options.displayMode === VcfDisplayModes.AUTO) {
            if (currentViewLength > 100000) {
                return <NumericalTrack {...this.props} unit="feature density" options={numericalOptions} />;
            } else {
                this.scales = this.computeColorScales(data, options.colorScaleKey, options.lowValueColor, options.highValueColor)
                return (
                    <AnnotationTrack
                        {...this.props}
                        rowHeight={options.rowHeight + ROW_VERTICAL_PADDING}
                        getAnnotationElement={this.renderAnnotation}
                        featurePadding={this.paddingFunc}
                    />
                );
            }
        } else {
            if (options.displayMode === VcfDisplayModes.DENSITY) {
                return <NumericalTrack {...this.props} unit="feature density" options={numericalOptions} />;
            } else {
                this.scales = this.computeColorScales(data, options.colorScaleKey, options.lowValueColor, options.highValueColor)
                return (
                    <AnnotationTrack
                        {...this.props}
                        rowHeight={options.rowHeight + ROW_VERTICAL_PADDING}
                        getAnnotationElement={this.renderAnnotation}
                        featurePadding={this.paddingFunc}
                    />
                );
            }
        }
    }
}

export const VcfTrack = withTooltip(VcfTrackNoTooltip as any);
