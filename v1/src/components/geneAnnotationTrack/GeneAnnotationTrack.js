import AnnotationArranger from './AnnotationArranger';
import GeneDetail from './GeneDetail';
import GeneDataSource from '../../dataSources/GeneDataSource';

import React from 'react';
import SvgContainer from '../SvgContainer';
import Track from '../Track';
import TrackLegend from '../TrackLegend';
import TrackLoadingNotice from '../TrackLoadingNotice';

const HEIGHT = 120;

/**
 * A gene annotation track.
 * 
 * @author Silas Hsu
 */
class GeneAnnotationTrack extends Track {
    static TYPE_NAME = "gene annotation";

    constructor(props) {
        super(props);
        this.state.geneDetail = null;

        this.divNode = null;
        this.geneClicked = this.geneClicked.bind(this);
    }

    makeDefaultDataSource() {
        return new GeneDataSource();
    }

    /**
     * Called when a gene annotation is clicked.  Sets state so a detail box is displayed.
     * 
     * @param {MouseEvent} event 
     * @param {Gene} gene 
     */
    geneClicked(event, gene) {
        event.stopPropagation();
        let detail = <GeneDetail
            left={event.clientX}
            top={event.clientY}
            rightBoundary={this.divNode.clientWidth}
            gene={gene}
        />;
        this.setState({geneDetail: detail});
    }

    render() {
        let svgStyle = {
            borderTop: "1px solid black",
            borderBottom: "1px solid black",
            padding: "10px",
            height: HEIGHT,

            position: "relative",
            left: this.props.xOffset,
        };
        if (this.state.error) {
            svgStyle.backgroundColor = "red";
        }

        return (
        <div
            ref={node => this.divNode = node}
            onClick={(event) => this.setState({geneDetail: null})}
            style={{overflow: "hidden"}}
        >
            <TrackLegend height={HEIGHT} trackModel={this.props.trackModel} />
            {this.state.isLoading ? <TrackLoadingNotice height={HEIGHT} /> : null}
            <SvgContainer
                svgStyle={svgStyle}
                model={this.props.viewRegion}
            >
                {this.state.data ? 
                    <AnnotationArranger
                        data={this.state.data}
                        onGeneClick={this.geneClicked}
                        maxRows={this.props.maxRows}
                    />
                    : null
                }
            </SvgContainer>
            {this.state.geneDetail}
        </div>
        );
    }
}

export default GeneAnnotationTrack;
