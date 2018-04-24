import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import BedAnnotation from './BedAnnotation';
import FeatureDetail from '../commonComponents/annotation/FeatureDetail';
import NewTrack from '../NewTrack';
import GeneAnnotationTrack from '../geneAnnotationTrack/GeneAnnotationTrack';

import AnnotationTrack from '../commonComponents/annotation/AnnotationTrack';
import Tooltip from '../commonComponents/Tooltip';
import configOptionMerging from '../commonComponents/configOptionMerging';
import { configStaticDataSource } from '../commonComponents/configDataFetch';
import configDataProcessing from '../commonComponents/configDataProcessing';
import withTooltip from '../commonComponents/withTooltip';

import BedSource from '../../../dataSources/BedSource';
import DataProcessor from '../../../dataSources/DataProcessor';

import Feature from '../../../model/Feature';
import ChromosomeInterval from '../../../model/interval/ChromosomeInterval';
import LinearDrawingModel from '../../../model/LinearDrawingModel';

const BedColumnIndices = {
    NAME: 3,
    SCORE: 4,
    STRAND: 5,
};

const DEFAULT_OPTIONS = {
    color: "blue",
    rows: 5,
};

/**
 * Converter of BedRecords to Feature.
 */
class BedProcessor extends DataProcessor {
    /**
     * Extracts Features from the `data` prop.
     * 
     * @param {Object} props - track props, whose `data` prop should include an array of BedRecord
     * @return {Feature[]} extracted Features from the props
     */
    process(props) {
        if (!props.data) {
            return [];
        };

        let features = props.data.map(record => new Feature(
            // "." is a placeholder that means "undefined" in the bed file.
            record[BedColumnIndices.NAME] === "." ? "" : record[BedColumnIndices.NAME],
            new ChromosomeInterval(record.chr, record.start, record.end),
            record[BedColumnIndices.STRAND]
        ));
        for (let i = 0; i < features.length; i++) {
            features[i].index = i; // Assign each feature an index so we can use it as a key when rendering
        }
        return features;
    }
}

/**
 * Track component for BED annotations.
 * 
 * @author Silas Hsu
 */
export class BedTrack extends React.Component {
    static propTypes = Object.assign({}, 
        NewTrack.trackContainerProps,
        configOptionMerging.INJECTED_PROPS,
        configStaticDataSource.INJECTED_PROPS,
        withTooltip.INJECTED_PROPS,
        {
        /**
         * Features to render.  BedProcessor provides this.
         */
        data: PropTypes.arrayOf(PropTypes.instanceOf(Feature)).isRequired,
        }
    );

    static defaultProps = {
        options: {},
        onShowTooltip: element => undefined,
        onHideTooltip: () => undefined,
    };

    constructor(props) {
        super(props);
        this.renderTooltip = this.renderTooltip.bind(this);
        this.renderAnnotation = this.renderAnnotation.bind(this);
    }

    /**
     * Renders the tooltip for a feature.
     * 
     * @param {MouseEvent} event - mouse event that triggered the tooltip request
     * @param {Feature} feature - Feature for which to display details
     */
    renderTooltip(event, feature) {
        const tooltip = (
            <Tooltip pageX={event.pageX} pageY={event.pageY} onClose={this.props.onHideTooltip} >
                <FeatureDetail feature={feature} />
            </Tooltip>
        );
        this.props.onShowTooltip(tooltip);
    }

    /**
     * Renders one annotation.
     * 
     * @param {Feature} feature - feature to render
     * @param {OpenInterval} absInterval - location of the feature in navigation context
     * @param {number} y - y coordinate to render the annotation
     * @param {boolean} isLastRow - whether the annotation is assigned to the last configured row
     * @param {DisplayedRegionModel} - region in which to draw
     * @param {number} - width of the drawing area
     * @param {Object} - x range of visible pixels
     * @return {JSX.Element} element visualizing the feature
     */
    renderAnnotation(feature, absInterval, y, isLastRow, viewRegion, width, viewWindow) {
        const drawModel = new LinearDrawingModel(viewRegion, width);
        return <BedAnnotation
            key={feature.index}
            feature={feature}
            drawModel={drawModel}
            absLocation={absInterval}
            y={y}
            isMinimal={isLastRow}
            color={this.props.options.color}
            onClick={this.renderTooltip}
        />;
    }

    render() {
        return <AnnotationTrack
            {...this.props}
            rowHeight={BedAnnotation.HEIGHT + 2}
            getHorizontalPadding={5}
            getAnnotationElement={this.renderAnnotation}
        />;
    }
}

const withOptionMerging = configOptionMerging(DEFAULT_OPTIONS);
const withDataFetch = configStaticDataSource(props => new BedSource(props.trackModel.url));
const withDataProcessing = configDataProcessing(new BedProcessor());
const configure = _.flowRight([withOptionMerging, withDataFetch, withDataProcessing, withTooltip]);
const ConfiguredBedTrack = configure(BedTrack);

export const BedTrackConfig = {
    component: ConfiguredBedTrack,
    menuItems: GeneAnnotationTrack.menuItems,
    defaultOptions: DEFAULT_OPTIONS,
};

export default BedTrackConfig;
