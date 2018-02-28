import React from 'react';
import PropTypes from 'prop-types'; 

import Feature from "../../model/Feature";
import ChromosomeInterval from "../../model/interval/ChromosomeInterval";
import DisplayedRegionModel from "../../model/DisplayedRegionModel";
import NavigationContext from "../../model/NavigationContext";
import SvgJsManaged from "../SvgJsManaged";
import GeneAnnotation from "../track/geneAnnotationTrack/GeneAnnotation";

class StandaloneGeneAnnotation {
    static propTypes = {
        gene: PropTypes.object.isRequried,
        width: PropTypes.number
    }
    
    render() {
        const {gene, width} = this.props;
        console.log(gene);
        console.log(width);
        const region = new Feature(gene.name, new ChromosomeInterval(gene.txStart, gene.txEnd));
        const drawModel = new DisplayedRegionModel(new NavigationContext(gene.name, [region]));
        return <svg width={width}>
        <SvgJsManaged><GeneAnnotation gene={gene} isLabeled={true} drawModel={drawModel} leftBoundary={-Infinity} /></SvgJsManaged>
        </svg>
    }
}

export default StandaloneGeneAnnotation;