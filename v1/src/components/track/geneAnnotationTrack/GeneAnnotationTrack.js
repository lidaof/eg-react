import React from 'react';

import AnnotationArranger from './AnnotationArranger';
import GeneDetail from './GeneDetail';
import { VISUALIZER_PROP_TYPES } from '../Track';
import TrackLegend from '../TrackLegend';

import { GeneFormatter } from '../../../model/Gene';
import LinearDrawingModel from '../../../model/LinearDrawingModel';
import BedSource from '../../../dataSources/BedSource';

const HEIGHT = 105;

/**
 * A gene annotation visualizer.
 * 
 * @author Silas Hsu
 */
class GeneAnnotationVisualizer extends React.PureComponent {
    static propTypes = VISUALIZER_PROP_TYPES;

    constructor(props) {
        super(props);
        this.geneClicked = this.geneClicked.bind(this);
    }

    /**
     * Called when a gene annotation is clicked.  Sets state so a detail box is displayed.
     * 
     * @param {MouseEvent} event 
     * @param {Gene} gene 
     */
    geneClicked(event, gene) {
        this.props.onTooltip(event, <GeneDetail gene={gene} />);
    }

    render() {
        const svgStyle = {marginTop: 5, display: "block", overflow: "visible"};
        const drawModel = new LinearDrawingModel(this.props.viewRegion, this.props.width);
        return (
        <svg width={this.props.width} height={HEIGHT} style={svgStyle} >
            <AnnotationArranger
                data={this.props.data}
                drawModel={drawModel}
                onGeneClick={this.geneClicked}
            />
        </svg>
        );
    }
}

const GeneAnnotationTrack = {
    getDataSource: (trackModel) => new BedSource(trackModel.url, new GeneFormatter()),
    visualizer: GeneAnnotationVisualizer
};

export default GeneAnnotationTrack;
