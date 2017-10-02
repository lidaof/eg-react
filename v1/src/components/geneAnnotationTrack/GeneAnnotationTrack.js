import AnnotationArranger from './AnnotationArranger';
import GeneDetail from './GeneDetail';
import { LEFT_MOUSE } from '../DomDragListener';
import React from 'react';
import SvgContainer from '../SvgContainer';
import Track from '../Track';
import ViewDragListener from '../ViewDragListener';

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
        this.viewDrag = this.viewDrag.bind(this);
        this.viewDragEnd = this.viewDragEnd.bind(this);
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
        return (
        <div style={{padding: "20px"}} ref={node => this.divNode = node} onClick={(event) => this.setState({geneDetail: null})}>
            <SvgContainer
                svgStyle={{border: "1px solid black", padding: "10px"}}
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
                <ViewDragListener
                    button={LEFT_MOUSE}
                    onViewDrag={this.viewDrag}
                    onViewDragEnd={this.viewDragEnd}
                />
            </SvgContainer>
            {this.state.geneDetail}
            {this.state.isLoading ? <p>Loading...</p> : null}
        </div>
        );
    }
}

export default GeneAnnotationTrack;
