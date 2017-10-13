import AnnotationArranger from './AnnotationArranger';
import GeneDetail from './GeneDetail';
import GeneDataSource from '../../dataSources/GeneDataSource';
import React from 'react';
import SvgContainer from '../SvgContainer';
import Track from '../Track';

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
        let svgStyle = {border: "1px solid black", padding: "10px", height: "120px"};
        if (this.state.isLoading) {
            svgStyle.opacity = 0.5;
        }
        if (this.state.error) {
            svgStyle.backgroundColor = "red";
        }

        return (
        <div
            style={{paddingLeft: "20px", paddingRight: "20px"}}
            ref={node => this.divNode = node}
            onClick={(event) => this.setState({geneDetail: null})}
        >
            <SvgContainer
                svgStyle={svgStyle}
                model={this.props.viewRegion}
                viewBoxX={this.state.xOffset}
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
