import React from 'react';

import AnnotationArranger from './AnnotationArranger';
import GeneDetail from './GeneDetail';
import Gene from '../../model/Gene';
import RegionExpander from '../../model/RegionExpander';
import FeatureSource from '../../dataSources/FeatureSource';

import SvgContainer from '../SvgContainer';
import Track from '../Track';
import TrackLegend from '../TrackLegend';
import TrackLoadingNotice from '../TrackLoadingNotice';
import ScrollingData from '../ScrollingData';

const HEIGHT = 120;

/**
 * A gene annotation track.
 * 
 * @author Silas Hsu
 */
class GeneAnnotationTrack extends Track {
    static TYPE_NAME = "hammock";

    constructor(props) {
        super(props);
        this.state.geneDetail = null;

        this.genes = this.state.data ? this.state.data.map(feature => new Gene(feature)) : null;
        this.divNode = null;
        this.geneClicked = this.geneClicked.bind(this);
    }

    makeDefaultDataSource() {
        return new FeatureSource(this.props.trackModel.url);
    }

    componentWillUpdate(nextProps, nextState) {
        if (this.state.data !== nextState.data) {
            this.genes = nextState.data ? nextState.data.map(feature => new Gene(feature)) : null;
        }
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
        let svgStyle = {paddingTop: 10, display: "block"};
        if (this.state.error) {
            svgStyle.backgroundColor = "red";
        }
        let regionExpander = new RegionExpander(this.props.viewExpansionValue);
        let viewExpansion = regionExpander.calculateExpansion(this.props.width, this.props.viewRegion);

        return (
        <div
            style={{display: "flex", borderBottom: "1px solid grey"}}
            ref={node => this.divNode = node}
            onClick={(event) => this.setState({geneDetail: null})}
        >
            <TrackLegend height={HEIGHT} trackModel={this.props.trackModel} />
            {this.state.isLoading ? <TrackLoadingNotice height={this.props.height} /> : null}
            <ScrollingData
                width={this.props.width}
                height={HEIGHT}
                viewExpansion={viewExpansion}
                xOffset={this.props.xOffset}
            >
                <SvgContainer
                    model={viewExpansion.expandedRegion}
                    drawModelWidth={viewExpansion.expandedRegion.expandedWidth}
                    svgProps={{style: svgStyle}}
                >
                    {this.genes ?
                        <AnnotationArranger
                            data={this.genes}
                            viewRegion={this.props.viewRegion}
                            leftBoundary={viewExpansion.leftExtraPixels}
                            onGeneClick={this.geneClicked}
                            maxRows={this.props.maxRows}
                        />
                        : null
                    }
                </SvgContainer>
            </ScrollingData>
            {this.state.geneDetail}
        </div>
        );
    }
}

export default GeneAnnotationTrack;
