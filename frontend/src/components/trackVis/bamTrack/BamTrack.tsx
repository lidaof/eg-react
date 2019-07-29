import React from 'react';
import { BamAnnotation, BamAnnotationOptions } from './BamAnnotation';

import AnnotationTrack from '../commonComponents/annotation/AnnotationTrack';
import Tooltip from '../commonComponents/tooltip/Tooltip';
import { withTooltip, TooltipCallbacks } from '../commonComponents/tooltip/withTooltip';
import FeatureDetail from '../commonComponents/annotation/FeatureDetail';

import { PropsFromTrackContainer } from '../commonComponents/Track';
import { BamRecord } from '../../../model/BamRecord';
import { PlacedFeatureGroup } from '../../../model/FeatureArranger';

const ROW_PADDING = 2;

interface BamTrackProps extends PropsFromTrackContainer, TooltipCallbacks {
    data: BamRecord[];
    options: BamAnnotationOptions
}

/**
 * Bam visualizer specification.
 * 
 * @author Silas Hsu
 */
class BamTrack extends React.Component<BamTrackProps> {
    constructor(props: BamTrackProps) {
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
    renderAnnotation(placedGroup: PlacedFeatureGroup, y: number, isLastRow: boolean, index: number) {
        if (isLastRow) {
            return null;
        }

        return placedGroup.placedFeatures.map((placement, i) => 
            <BamAnnotation
                key={i}
                placedRecord={placement}
                options={this.props.options}
                y={y}
                onClick={this.renderTooltip}
            />
        );
    }

    /**
     * Renders the tooltip for a BAM record.
     * 
     * @param {MouseEvent} event - mouse event that triggered the tooltip request
     * @param {BamRecord} feature - BAM record for which to display details
     */
    renderTooltip(event: React.MouseEvent, record: BamRecord) {
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
            rowHeight={BamAnnotation.HEIGHT + ROW_PADDING}
            getAnnotationElement={this.renderAnnotation}
        />;
    }
}

export default withTooltip(BamTrack as any);
