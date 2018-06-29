import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import { scaleLinear } from 'd3-scale';

import Track from './commonComponents/Track';
import TrackLegend from './commonComponents/TrackLegend';
import HoverTooltipContext from './commonComponents/tooltip/HoverTooltipContext';
import GenomicCoordinates from './commonComponents/GenomicCoordinates';
import DesignRenderer, { RenderTypes } from '../../art/DesignRenderer';

import TrackModel from '../../model/TrackModel';
import { FeatureAggregator } from '../../model/FeatureAggregator';

import './commonComponents/tooltip/Tooltip.css';


/**
 * Visualizer for MethylC tracks. 
 * 
 * @author Daofeng Li
 */
class GenomeAlignTrack extends React.PureComponent {
    static propTypes = Object.assign({},
        Track.tracksFromTrackContainer,
        {
        data: PropTypes.array.isRequired, //PropTypes.arrayOf(PropTypes.instanceOf(MethylCRecord)).isRequired,
        }
    );

    constructor(props) {
        super(props);
        this.aggregateRecords = memoizeOne(this.aggregateRecords);
        this.renderTooltipContents = this.renderTooltipContents.bind(this);
    }

    aggregateRecords(data, viewRegion, width) {
        const aggregator = new FeatureAggregator();
        const xToRecords = aggregator.makeXMap(data, viewRegion, width);
        return xToRecords.map(MethylCRecord.aggregateByStrand);
    }


    /**
     * Renders the tooltip contents that appear when mousing over the track
     * 
     * @param {number} x - x coordinate of the mouseover relative to the left side of the visualizer
     * @return {JSX.Element} tooltip contents to render
     */
    renderTooltipContents(x) {
        const {trackModel, viewRegion, width, options} = this.props;
        const strandsAtPixel = this.aggregatedRecords[x];

        return <div>
            {this.renderTooltipContentsForStrand(strandsAtPixel, options.isCombineStrands ? "combined" : "forward")}
            {!options.isCombineStrands && this.renderTooltipContentsForStrand(strandsAtPixel, "reverse")}
            <div className="Tooltip-minor-text">
                <GenomicCoordinates viewRegion={viewRegion} width={width} x={x} />
            </div>
            <div className="Tooltip-minor-text" >{trackModel.getDisplayLabel()}</div>
        </div>;
    }


    renderVisualizer() {
        const {width, options} = this.props;
        const {height, colorsForContext, depthColor, isCombineStrands} = options;
        const childProps = {
            data: this.aggregatedRecords, scales: this.scales, htmlType: RenderTypes.CANVAS,
            width, height, colorsForContext, depthColor
        };
        let strandRenderers, tooltipY;
        if (isCombineStrands) {
            strandRenderers = [ <StrandVisualizer key={0} {...childProps} strand="combined" /> ];
            tooltipY = height;
        } else {
            strandRenderers = [
                <StrandVisualizer key={0} {...childProps} strand="forward" />,
                <hr key={"center"} style={{margin: 0}} />,
                <StrandVisualizer key={1} {...childProps} strand="reverse" />,
            ];
            tooltipY = height * 2;
        }

        return (
        <HoverTooltipContext tooltipRelativeY={tooltipY} getTooltipContents={this.renderTooltipContents} >
            {strandRenderers}
        </HoverTooltipContext>
        );
    }

    /** 
     * @inheritdoc
     */
    render() {
        const {data, trackModel, viewRegion, width, options} = this.props;
        this.aggregatedRecords = this.aggregateRecords(data, viewRegion, width);
        this.scales = this.computeScales(this.aggregatedRecords, options.height);
        return <Track
            {...this.props}
            visualizer={this.renderVisualizer()}
        />
    }
}

export default withDefaultOptions(GenomeAlignTrack);

class StrandVisualizer extends React.PureComponent {
    static propTypes = {
        data: PropTypes.array.isRequired,
        strand: PropTypes.string.isRequired,
        scales: PropTypes.object.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        colorsForContext: PropTypes.object.isRequired,
        depthColor: PropTypes.string.isRequired,
        htmlType: PropTypes.any,
    };

    getColorsForContext(contextName) {
        return this.props.colorsForContext[contextName] || UNKNOWN_CONTEXT_COLORS;
    }

    renderBarElement(x) {
        const {data, scales, strand, height} = this.props;
        const pixelData = data[x][strand];
        if (!pixelData) {
            return null;
        }

        
        let backgroundColor;
        if (pixelData.contextValues.length === 1) {
            const contextName = pixelData.contextValues[0].context;
            backgroundColor = this.getColorsForContext(contextName).background;
        } else {
            backgroundColor = OVERLAPPING_CONTEXTS_COLORS.background
        }

        let elements = [
            <rect key={x + "bg"} x={x} y={VERTICAL_PADDING} width={1} height={height} fill={backgroundColor} />
        ];
        for (let contextData of pixelData.contextValues) {
            const contextName = contextData.context;
            const drawY = scales.methylToY(contextData.value);
            const drawHeight = height - drawY;
            const color = this.getColorsForContext(contextName).color;
            elements.push(<rect
                key={x + contextName}
                x={x}
                y={drawY}
                width={1}
                height={drawHeight}
                fill={color}
                fillOpacity={0.75}
            />);
        }
        
        return elements;
    }



    render() {
        const {data, strand, width, height, htmlType} = this.props;
        const style = strand === PLOT_DOWNWARDS_STRAND ? {transform: "scale(1, -1)"} : undefined;
        let bars = [];
        for (let x = 0; x < data.length; x++) {
            bars.push(this.renderBarElement(x))
        }
        return (
        <DesignRenderer
            type={htmlType}
            width={width}
            height={height}
            style={style}
        >
            {bars}
        </DesignRenderer>
        );
    }
}
