import AnnotationArranger from './AnnotationArranger';
import GeneDetail from './GeneDetail';
import React from 'react';
import SvgContainer from '../SvgContainer';
import Track from '../Track';

class GeneAnnotationTrack extends Track {
    constructor(props) {
        super(props);
        this.state.geneDetail = null;

        this.divNode = null;
        this.geneClicked = this.geneClicked.bind(this);
    }

    geneClicked(event, gene) {
        let detail = <GeneDetail
            left={event.clientX}
            top={event.clientY}
            rightBoundary={this.divNode.clientWidth}
            gene={gene}
        />;
        this.setState({geneDetail: detail});
    }

    render() {
        if (this.state.isLoading) {
            return <p>Loading...</p>;
        }
        return (
        <div ref={node => this.divNode = node} onClick={(event) => this.setState({geneDetail: null})}>
            <SvgContainer svgStyle={{border: "1px solid black"}}>
                <AnnotationArranger
                    yOffset={10}
                    data={this.state.data}
                    model={this.props.viewRegion}
                    onGeneClick={this.geneClicked}
                    maxRows={this.props.maxRows}
                />
            </SvgContainer>
            {this.state.geneDetail}
        </div>
        );
    }
}

export default GeneAnnotationTrack;
