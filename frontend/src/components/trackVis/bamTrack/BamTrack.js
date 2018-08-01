import React from 'react';
// import { BamAnnotation } from './BamAnnotation';

import AnnotationTrack from '../commonComponents/annotation/AnnotationTrack';
import Tooltip from '../commonComponents/tooltip/Tooltip';
import withTooltip from '../commonComponents/tooltip/withTooltip';
import FeatureDetail from '../commonComponents/annotation/FeatureDetail';

import { PlacedFeature } from '../../../model/FeaturePlacer';

const ROW_PADDING = 2;

/**
 * Bam visualizer specification.
 * 
 * @author Silas Hsu
 */
class BamTrack extends React.Component {
    constructor(props) {
        super(props);
        this.renderTooltip = this.renderTooltip.bind(this);
        this.renderAnnotation = this.renderAnnotation.bind(this);
    }

    /**
     * Renders one annotation.
     * 
     * @param {PlacedFeature} placedRecord - placed BAM record
     * @param {number} y - y coordinate of the top of the record
     * @param {boolean} isLastRow - whether the annotation is assigned to the last configured row
     * @param {number} index - iteration index
     * @return {JSX.Element} element visualizing the BAM record
     */
    renderAnnotation(placedRecord, y, isLastRow, index) {
        if (isLastRow) {
            return null;
        }

        const {viewRegion, width, options} = this.props;
        return null;
        /*
        return <BamAnnotation
            key={index}
            record={placedRecord.feature}
            navContext={viewRegion.getNavigationContext()}
            contextLocation={placedRecord.contextLocation}
            drawModel={new LinearDrawingModel(viewRegion, width)}
            y={y}
            options={options}
            onClick={this.renderTooltip}
        />;
        */
    }

    /**
     * Renders the tooltip for a BAM record.
     * 
     * @param {MouseEvent} event - mouse event that triggered the tooltip request
     * @param {BamRecord} feature - BAM record for which to display details
     */
    renderTooltip(event, record) {
        const alignment = record.getAlignment();
        const tooltip = (
            <Tooltip pageX={event.pageX} pageY={event.pageY} onClose={this.props.onHideTooltip} >
                <FeatureDetail feature={record} />
                <div style={{fontFamily: 'monospace', whiteSpace: 'pre'}} >
                    <div>Ref  {alignment.reference}</div>
                    <div>     {alignment.lines}</div>
                    <div>Read {alignment.read}</div>
                </div>
            </Tooltip>
        );
        this.props.onShowTooltip(tooltip);
    }

    render() {
        return <AnnotationTrack
            {...this.props}
            data={this.props.data}
            // rowHeight={BamAnnotation.HEIGHT + ROW_PADDING}
            getAnnotationElement={this.renderAnnotation}
        />;
    }
}

export default withTooltip(BamTrack);
